import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { newDb } from 'pg-mem'
import bcrypt from 'bcryptjs'
import { crearApp } from './index.mjs'

test('Registro, autenticación y control de sesiones por HTTP', async () => {
    const memoria = newDb()
    memoria.public.none(await readFile(new URL('./__docker-pg/admin.sql', import.meta.url), 'utf8'))
    const { Pool } = memoria.adapters.createPg()
    const bd = new Pool()
    const servidor = crearApp(bd, 'secreto-exclusivo-de-pruebas').listen(0, '127.0.0.1')
    await new Promise(resolve => servidor.once('listening', resolve))
    const base = `http://127.0.0.1:${servidor.address().port}`
    async function pedir(ruta, datos, cookie) {
        return fetch(base + ruta, {
            method: datos ? 'POST' : 'GET', redirect: 'manual',
            headers: { ...(datos ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
            body: datos ? new URLSearchParams(datos) : undefined
        })
    }
    const credenciales = { usuario: 'seba', pass: 'claveSegura123' }
    try {
        assert.equal((await pedir('/login/')).status, 200)
        assert.equal((await pedir('/admin/')).headers.get('location'), '/login/?autorizado=false')
        assert.equal((await pedir('/registrar', { usuario: 'seba', pass: '123' })).headers.get('location'), '/login/alta.html?datosinvalidos')
        assert.equal((await pedir('/registrar', { usuario: ['seba'], pass: '😀'.repeat(20) })).headers.get('location'), '/login/alta.html?datosinvalidos')
        assert.equal((await pedir('/registrar', credenciales)).headers.get('location'), '/login/?usuarioregistrado')
        const usuario = (await bd.query('SELECT * FROM usuarios')).rows[0]
        assert.notEqual(usuario.password_hash, credenciales.pass)
        assert.equal(await bcrypt.compare(credenciales.pass, usuario.password_hash), true)
        assert.equal((await pedir('/registrar', credenciales)).headers.get('location'), '/login/alta.html?usuarioexistente')
        for (const datos of [{ usuario: 'noexiste', pass: 'claveSegura123' }, { usuario: 'seba', pass: 'incorrecta' }, { usuario: "' OR 1=1 --", pass: 'claveSegura123' }]) {
            const respuesta = await pedir('/autenticacion', datos)
            assert.equal(respuesta.headers.get('location'), '/login/?usuarioincorrecto')
            assert.equal(respuesta.headers.get('set-cookie'), null)
        }
        const login = await pedir('/autenticacion', credenciales)
        assert.equal(login.headers.get('location'), '/admin/')
        const cabecera = login.headers.get('set-cookie')
        assert.match(cabecera, /HttpOnly/)
        assert.match(cabecera, /SameSite=Lax/)
        const cookie = cabecera.split(';')[0]
        const sesion = (await bd.query('SELECT session_id FROM usuarios')).rows[0].session_id
        assert.equal(sesion.length, 32)
        assert.ok(decodeURIComponent(cookie).includes(sesion))
        assert.equal((await pedir('/admin/', undefined, cookie)).status, 200)
        assert.equal((await pedir('/admin/index.html', undefined, 'sesionId=123456')).status, 302)
        assert.equal((await pedir('/admin/', undefined, cookie + 'alterada')).status, 302)
        const segundoLogin = await pedir('/autenticacion', credenciales)
        const nuevaCookie = segundoLogin.headers.get('set-cookie').split(';')[0]
        assert.notEqual(nuevaCookie, cookie)
        assert.equal((await pedir('/admin/', undefined, cookie)).status, 302)
        assert.equal((await pedir('/admin/', undefined, nuevaCookie)).status, 200)
        assert.equal((await pedir('/salir', {}, nuevaCookie)).headers.get('location'), '/login/')
        assert.equal((await bd.query('SELECT session_id FROM usuarios')).rows[0].session_id, null)
        assert.equal((await pedir('/admin/', undefined, nuevaCookie)).status, 302)
    } finally {
        await new Promise(resolve => servidor.close(resolve))
        await bd.end()
    }
})

test('Rechaza configuración sin secreto de cookies', () => {
    assert.throws(() => crearApp({}, ''), /COOKIE_SECRET/)
})
