export class Telefone {
    #id;
    #telefone;
    #idCliente;

    constructor(telefone, idCliente = null, id = null) {
        this.telefone = telefone;
        this.#idCliente = idCliente;
        this.#id = id;
    }

    get id() {
        return this.#id;
    }
    get telefone() {
        return this.#telefone;
    }
    get idCliente() {
        return this.#idCliente;
    }

    set telefone(value) {
        this.#validarTelefone(value);
        this.#telefone = value;
    }

    #validarTelefone(value) {
        if (!value || !/^\d{10,11}$/.test(value)) {
            throw new Error("Telefone inválido");
        }
    }
}