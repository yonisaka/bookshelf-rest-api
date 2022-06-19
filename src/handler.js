const { nanoid } = require('nanoid');
const bookshelf = require('./bookshelf');

const storeBookHandler = (request, h) => {
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;
    if (name === undefined) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        }).code(400);
        return response;
    }
    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
        return response;
    }
    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = pageCount === readPage;
    bookshelf.push({
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
    });
    const isSuccess = bookshelf.filter((b) => b.id === id).length > 0;
    if (isSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
        }).code(201);
        return response;
    }
    const response = h.response({
        status: 'error',
        message: 'Buku gagal ditambahkan',
    }).code(500);
    return response;
};

const getAllBooksHandler = (request, h) => {
    const params = request.query;
    if (params.name) {
        const books = bookshelf.filter((b) => b.name.toLowerCase() === params.name.toLowerCase());
        return h.response({
            status: 'success',
            data: {
                books: books.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        }).code(200);
    }
    if (params.reading) {
        let readedBooks;
        if (params.reading === 1) {
            readedBooks = bookshelf.filter((b) => b.reading === true);
        } else {
            readedBooks = bookshelf.filter((b) => b.reading === false);
        }

        return h.response({
            status: 'success',
            data: {
                books: readedBooks.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        }).code(200);
    }
    if (params.finished) {
        let finishedBooks;
        if (params.finished === 1) {
            finishedBooks = bookshelf.filter((b) => b.readPage === b.pageCount);
        } else {
            finishedBooks = bookshelf.filter((b) => b.readPage < b.pageCount);
        }

        return h.response({
            status: 'success',
            data: {
                books: finishedBooks.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        }).code(200);
    }
    if (!params.name && !params.reading && !params.finished) {
        return h.response({
            status: 'success',
            data: {
                books: bookshelf.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        }).code(200);
    }
    return h.response({
        status: 'fail',
        message: 'Catatan tidak ditemukan',
    }).code(404);
};

const getBookByIdHandler = (request, h) => {
    const { bookId } = request.params;
    const book = bookshelf.filter((b) => b.id === bookId)[0];
    if (book !== undefined) {
        return {
            status: 'success',
            data: {
                book,
            },
        };
    }
    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
    }).code(404);
    return response;
};

const updateBookByIdHandler = (request, h) => {
    const { bookId } = request.params;
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;
    if (name === undefined) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku',
        }).code(400);
        return response;
    }
    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
        return response;
    }
    const updatedAt = new Date().toISOString();
    const index = bookshelf.findIndex((b) => b.id === bookId);
    if (index !== -1) {
        bookshelf[index] = {
            ...bookshelf[index],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            updatedAt,
        };
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui',
        }).code(200);
        return response;
    }
    const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
    }).code(404);
    return response;
};

const destroyBookByIdHandler = (request, h) => {
    const { bookId } = request.params;
    const index = bookshelf.findIndex((b) => b.id === bookId);
    if (index !== -1) {
        bookshelf.splice(index, 1);
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil dihapus',
        }).code(200);
        return response;
    }
    const response = h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
    }).code(404);
    return response;
};

module.exports = {
    storeBookHandler,
    getAllBooksHandler,
    getBookByIdHandler,
    updateBookByIdHandler,
    destroyBookByIdHandler,
};
