import { connection } from "../configs/Database.js";

const normalizarTelefones = (telefones) => {
    if (!telefones) {
        return [];
    }
    if (Array.isArray(telefones)) {
        return telefones;
    }
    return [telefones];
};

const clienteRepository = {

    criar: async (cliente, endereco, telefones) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            const [resCli] = await conn.execute(
                "INSERT INTO clientes (nome, cpf) VALUES (?, ?)",
                [cliente.nome, cliente.cpf]
            );

            const idCliente = resCli.insertId;

            await conn.execute(
                `INSERT INTO enderecos 
                (cep, logradouro, numero, complemento, bairro, cidade, uf, idCliente)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [endereco.cep, endereco.logradouro, endereco.numero, endereco.complemento, endereco.bairro, endereco.cidade, endereco.uf, idCliente]
            );

            const listaTelefones = normalizarTelefones(telefones);

            for (let i = 0; i < listaTelefones.length; i++) {
                const tel = listaTelefones[i];

                if (tel && tel.telefone) {
                    await conn.execute(
                        "INSERT INTO telefones (telefone, idCliente) VALUES (?, ?)",
                        [tel.telefone, idCliente]
                    );
                }
            }

            await conn.commit();

            return { id: idCliente };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    selecionar: async () => {
        const sql = `SELECT *
            FROM clientes AS c 
            INNER JOIN enderecos AS e 
        	ON c.id = e.idCliente
            INNER JOIN telefones as t
        	ON c.id = t.idCliente
     `;
        const [rows] = await connection.execute(sql);
        return rows
    },

    atualizar: async (idCliente, cliente, endereco, telefones) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            await conn.execute(
                "UPDATE clientes SET nome = ?, cpf = ? WHERE id = ?",
                [cliente.nome, cliente.cpf, idCliente]
            );

            await conn.execute(
                `UPDATE enderecos SET cep = ?, logradouro = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, uf = ? WHERE idCliente = ?`,
                [endereco.cep, endereco.logradouro, endereco.numero, endereco.complemento, endereco.bairro, endereco.cidade, endereco.uf, idCliente]
            );

            await conn.execute(
                "DELETE FROM telefones WHERE idCliente = ?",
                [idCliente]
            );

            const listaTelefones = normalizarTelefones(telefones);

            for (const tel of listaTelefones) {
                if (!tel || !tel.telefone) continue;

                await conn.execute(
                    "INSERT INTO telefones (telefone, idCliente) VALUES (?, ?)",
                    [tel.telefone, idCliente]
                );
            }

            await conn.commit();

            return { id: idCliente };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    deletar: async (idCliente) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();
            await conn.execute("DELETE FROM telefones WHERE idCliente = ?", [idCliente]);
            await conn.execute("DELETE FROM enderecos WHERE idCliente = ?", [idCliente]);
            await conn.execute("DELETE FROM clientes WHERE id = ?", [idCliente]);
            await conn.commit();
            return { id: idCliente };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
};

export default clienteRepository;