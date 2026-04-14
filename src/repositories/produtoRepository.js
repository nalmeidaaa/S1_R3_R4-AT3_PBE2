import { connection } from "../configs/Database.js";

const produtoRepository = {
    criar: async (produto) => {
        const sql = 'INSERT INTO produtos (IdCategoria, Nome, Valor, CaminhoImagem) VALUES (?, ?, ?, ?)';
        const values = [produto.idCategoria, produto.nome, produto.valor, produto.caminhoImagem];
        const [rows] = await connection.execute(sql, values);
        return rows;
    },

    editar: async (produto) => {
        let sql, values;
        sql = 'UPDATE produtos SET IdCategoria=?, Nome=?, Valor=? WHERE Id = ?';
        values = [produto.idCategoria, produto.nome, produto.valor, produto.id];
        const [rows] = await connection.execute(sql, values);
        return rows;
    },

    deletar: async (id) => {
        const sql = 'DELETE FROM produtos WHERE Id = ?';
        const values = [id];
        const [rows] = await connection.execute(sql, values);
        return rows;
    },

    selecionar: async () => {
        const sql = 'SELECT * FROM produtos';
        const [rows] = await connection.execute(sql);
        return rows;
    },
};

export default produtoRepository;