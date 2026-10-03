"use strict";

const seed = {
  books: [
    { id: "1", title: "Operating System Concepts", edition: "9th", copyright: 2012, language: "ENGLISH", pages: 976, author: "Abraham Silberschatz", author_id: 1, publisher: "John Wiley & Sons", publisher_id: 1 },
    { id: "2", title: "Database System Concepts", edition: "6th", copyright: 2010, language: "ENGLISH", pages: 1376, author: "Abraham Silberschatz", author_id: 1, publisher: "John Wiley & Sons", publisher_id: 1 },
    { id: "3", title: "Computer Networks", edition: "5th", copyright: 2010, language: "ENGLISH", pages: 960, author: "Andrew S. Tanenbaum", author_id: 2, publisher: "Pearson Education", publisher_id: 2 },
    { id: "4", title: "Modern Operating Systems", edition: "4th", copyright: 2014, language: "ENGLISH", pages: 1136, author: "Andrew S. Tanenbaum", author_id: 2, publisher: "Pearson Education", publisher_id: 2 }
  ],
  authors: [
    { id: "1", author: "Abraham Silberschatz", nationality: "Israelis / American", birth_year: 1952, fields: "Database Systems, Operating Systems", books: [{ book_id: 1, title: "Operating System Concepts" }, { book_id: 2, title: "Database System Concepts" }] },
    { id: "2", author: "Andrew S. Tanenbaum", nationality: "Dutch / American", birth_year: 1944, fields: "Distributed computing, Operating Systems", books: [{ book_id: 3, title: "Computer Networks" }, { book_id: 4, title: "Modern Operating Systems" }] }
  ],
  publishers: [
    { id: "1", publisher: "John Wiley & Sons", country: "United States", founded: 1807, genere: "Academic", books: [{ book_id: 1, title: "Operating System Concepts" }, { book_id: 2, title: "Database System Concepts" }] },
    { id: "2", publisher: "Pearson Education", country: "United Kingdom", founded: 1844, genere: "Education", books: [{ book_id: 3, title: "Computer Networks" }, { book_id: 4, title: "Modern Operating Systems" }] }
  ]
};

module.exports = seed;
