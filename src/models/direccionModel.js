const pool = require('../config/db');

class Direccion {

    // Obtener la dirección de un usuario (con datos de localidad)
    static async getByUserId(id_usuario) {
        const result = await pool.query(`
            SELECT
                d.id_direccion,
                d.calle,
                d.numero,
                d.id_localidad,
                l.nombre AS localidad_nombre,
                l.cp
            FROM usuario u
            JOIN direccion d ON u.id_direccion = d.id_direccion
            JOIN localidad l ON d.id_localidad = l.id_localidad
            WHERE u.id_usuario = $1
        `, [id_usuario]);
        return result.rows[0] || null;
    }

    // Crear una nueva dirección y asignarla al usuario
    static async createForUser(id_usuario, { calle, numero, id_localidad }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insertar nueva dirección
            const newDir = await client.query(
                'INSERT INTO direccion (calle, numero, id_localidad) VALUES ($1, $2, $3) RETURNING *',
                [calle, numero, id_localidad]
            );
            const id_direccion = newDir.rows[0].id_direccion;

            // Asignar al usuario
            await client.query(
                'UPDATE usuario SET id_direccion = $1 WHERE id_usuario = $2',
                [id_direccion, id_usuario]
            );

            await client.query('COMMIT');

            // Devolver con datos de localidad
            const full = await pool.query(`
                SELECT d.id_direccion, d.calle, d.numero, d.id_localidad,
                       l.nombre AS localidad_nombre, l.cp
                FROM direccion d
                JOIN localidad l ON d.id_localidad = l.id_localidad
                WHERE d.id_direccion = $1
            `, [id_direccion]);

            return full.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    // Actualizar la dirección existente del usuario
    static async updateForUser(id_usuario, { calle, numero, id_localidad }) {
        // Obtener el id_direccion actual
        const user = await pool.query(
            'SELECT id_direccion FROM usuario WHERE id_usuario = $1',
            [id_usuario]
        );

        if (!user.rows[0] || !user.rows[0].id_direccion) {
            // No tiene dirección: crear una nueva
            return Direccion.createForUser(id_usuario, { calle, numero, id_localidad });
        }

        const id_direccion = user.rows[0].id_direccion;

        await pool.query(
            'UPDATE direccion SET calle = $1, numero = $2, id_localidad = $3 WHERE id_direccion = $4',
            [calle, numero, id_localidad, id_direccion]
        );

        const full = await pool.query(`
            SELECT d.id_direccion, d.calle, d.numero, d.id_localidad,
                   l.nombre AS localidad_nombre, l.cp
            FROM direccion d
            JOIN localidad l ON d.id_localidad = l.id_localidad
            WHERE d.id_direccion = $1
        `, [id_direccion]);

        return full.rows[0];
    }

    // Eliminar la dirección del usuario (desvincula y borra)
    static async deleteForUser(id_usuario) {
        const user = await pool.query(
            'SELECT id_direccion FROM usuario WHERE id_usuario = $1',
            [id_usuario]
        );

        if (!user.rows[0] || !user.rows[0].id_direccion) {
            return false;
        }

        const id_direccion = user.rows[0].id_direccion;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // Desvincular
            await client.query(
                'UPDATE usuario SET id_direccion = NULL WHERE id_usuario = $1',
                [id_usuario]
            );
            // Eliminar registro
            await client.query(
                'DELETE FROM direccion WHERE id_direccion = $1',
                [id_direccion]
            );
            await client.query('COMMIT');
            return true;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    // Obtener todas las localidades disponibles
    static async getLocalidades() {
        const result = await pool.query(
            'SELECT id_localidad, nombre, cp FROM localidad ORDER BY nombre'
        );
        return result.rows;
    }
}

module.exports = Direccion;
