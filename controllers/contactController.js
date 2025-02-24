const Contact = require('../models/contact');
const ejsPath= require('../helper/ejs-path');

const getContacts = (req, res) => {
    const title = 'Contacts';
    Contact.find()
        .then(contacts => res.render(ejsPath('contacts'), { contacts, title }))
        .catch((error) => {
            console.log(error);
            res.render(ejsPath('error'), { title: 'Error' });
        });
}



const redirect = (req, res) => {
    res.redirect("/contacts")
}

module.exports = {
    getContacts,
    redirect,
};