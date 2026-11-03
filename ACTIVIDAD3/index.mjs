import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import pool from './conexion.bd.mjs'

const directorio = path.dirname(fileURLToPath(import.meta.url))
const duracionSesion = 1000 * 60 * 60 * 24

export function crearApp(bd = pool, secreto = process.env.COOKIE_SECRET) {
    if (!secreto) throw new Error('Falta configurar COOKIE_SECRET en .env')
    const app = express()
    const opcionesCookie = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        signed: true,
        path: '/'
    }
    app.use(cookieParser(secreto))
    app.use(express.urlencoded({ extended: false, limit: '10kb' }))

    function credencialesValidas(usuario, pass) {
        return typeof usuario === 'string' && usuario.trim().length > 0 &&
            usuario.trim().length <= 150 && typeof pass === 'string' &&
            pass.length >= 8 && Buffer.byteLength(pass, 'utf8') <= 72
    }

    app.post('/registrar', async (req, res) => {
        const { usuario, pass } = req.body
        if (!credencialesValidas(usuario, pass)) return res.redirect('/login/alta.html?datosinvalidos')
        try {
            const salt = await bcrypt.genSalt(10)
            const clave_hasheada = await bcrypt.hash(pass, salt)
            await bd.query('INSERT INTO usuarios(username, password_hash) VALUES($1, $2)', [usuario.trim(), clave_hasheada])
            return res.redirect('/login/?usuarioregistrado')
        } catch (error) {
            if (error.code === '23505') return res.redirect('/login/alta.html?usuarioexistente')
            console.error('Error al registrar:', error.message)
            return res.status(503).send('No se pudo registrar. Intentá nuevamente más tarde.')
        }
    })

    app.post('/autenticacion', async (req, res) => {
        const { usuario, pass } = req.body
        if (!credencialesValidas(usuario, pass)) return res.redirect('/login/?usuarioincorrecto')
        try {
            const resultado = await bd.query('SELECT * FROM usuarios WHERE username = $1', [usuario.trim()])
            const usuarioBD = resultado.rows[0]
            const verificado = usuarioBD && await bcrypt.compare(pass, usuarioBD.password_hash)
            if (!verificado) return res.redirect('/login/?usuarioincorrecto')

            // El mismo identificador se guarda en la tabla y en la cookie firmada.
            const sesionId = nanoid(32)
            await bd.query('UPDATE usuarios SET session_id = $1 WHERE id = $2', [sesionId, usuarioBD.id])
            res.cookie('sesionId', sesionId, { ...opcionesCookie, maxAge: duracionSesion })
            return res.redirect('/admin/')
        } catch (error) {
            console.error('Error al autenticar:', error.message)
            return res.status(503).send('No se pudo iniciar sesión. Intentá nuevamente más tarde.')
        }
    })

    async function verificarCookie(req, res, next) {
        // Las cookies firmadas se leen desde signedCookies.
        const sesionId = req.signedCookies.sesionId
        if (typeof sesionId !== 'string' || !sesionId) return res.redirect('/login/?autorizado=false')
        try {
            const resultado = await bd.query('SELECT id FROM usuarios WHERE session_id = $1', [sesionId])
            if (resultado.rows.length === 0) {
                res.clearCookie('sesionId', opcionesCookie)
                return res.redirect('/login/?autorizado=false')
            }
            return next()
        } catch (error) {
            console.error('Error al verificar sesión:', error.message)
            return res.status(503).send('No se pudo verificar la sesión. Intentá nuevamente más tarde.')
        }
    }

    app.post('/salir', async (req, res) => {
        try {
            const sesionId = req.signedCookies.sesionId
            if (typeof sesionId === 'string' && sesionId) {
                await bd.query('UPDATE usuarios SET session_id = NULL WHERE session_id = $1', [sesionId])
            }
            res.clearCookie('sesionId', opcionesCookie)
            return res.redirect('/login/')
        } catch (error) {
            console.error('Error al cerrar sesión:', error.message)
            return res.status(503).send('No se pudo cerrar la sesión. Intentá nuevamente.')
        }
    })

    app.use('/admin', verificarCookie, (req, res, next) => {
        res.set('Cache-Control', 'no-store')
        next()
    }, express.static(path.join(directorio, 'front')))
    app.use('/login', express.static(path.join(directorio, 'login')))
    app.get('/', (req, res) => res.redirect('/login/'))
    return app
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const puerto = process.env.PUERTO || 3000
    crearApp().listen(puerto, () => console.log(`Servidor: http://localhost:${puerto}/login/`))
}
