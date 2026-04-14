import { connection } from "../configs/Database.js";

const normalizeTelefones = (telefones) => {
    if (!telefones) return [];

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

            const listaTelefones = normalizeTelefones(telefones);

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
        const sql = `SELECT c.id AS clienteId, c.nome, c.cpf, c.dataCad, e.cep, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.uf, t.telefone
    FROM clientes c
    LEFT JOIN enderecos e ON e.idCliente = c.id
    LEFT JOIN telefones t ON t.idCliente = c.id
    ORDER BY c.id;
  `;

        const [rows] = await connection.execute(sql);

        const clientes = [];

        for (const row of rows) {
            // procura se já existe esse cliente no array
            let cliente = clientes.find(c => c.id === row.clienteId);

            // se não existe, cria
            if (!cliente) {
                cliente = {
                    id: row.clienteId,
                    nome: row.nome,
                    cpf: row.cpf,
                    dataCad: row.dataCad,
                    endereco: {
                        cep: row.cep,
                        logradouro: row.logradouro,
                        numero: row.numero,
                        complemento: row.complemento,
                        bairro: row.bairro,
                        cidade: row.cidade,
                        uf: row.uf
                    },
                    telefones: []
                };

                clientes.push(cliente);
            }

            // adiciona telefone (se existir e não repetir)
            if (row.telefone && !cliente.telefones.includes(row.telefone)) {
                cliente.telefones.push(row.telefone);
            }
        }

        return clientes;
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

            const listaTelefones = normalizeTelefones(telefones);

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