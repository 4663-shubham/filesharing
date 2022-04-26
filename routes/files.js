// const router = require('express').Router();
// const multer = require('multer');
// const path = require('path');
// const File = require('../models/file')
// const { v4: uuid4 } = require('uuid');
// const { response } = require('express');
// const { parse } = require('path');


// //Basic Configration of Multer (Object for disc-storage)
// let storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, 'uploads/'),
//     filename: (req, file, cb) => {
//         const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
//         cb(null, uniqueName);
//     }  //Math.round genrate 1 billion no in betn zero to one (also excluding one)
//     //extname will generate the file extension name
// })


// let upload = multer({
//     storage,
//     limits: { fileSize: 1000000 * 100 },
// }).single('myfile');  // if file is uploaded by frontend by form then put the name attribute in single parameter



// router.post('/', (req, res) => {

//     // Store File 
//     upload(req, res, async (err) => {

//         //Validate Data request
//         if (!req.file) {
//             return res.json({ error: 'Input are not valid' });
//         }

//         if (err) {
//             return res.status(500).send({ error: err.message })
//         }

//         // Store into database
//         const file = new File({
//             filename: req.file.filename,
//             uuid: uuid4(),
//             path: req.file.path,
//             size: req.file.size
//         });

//         const response = await file.save();
//         return res.json({ file: `${process.env.app_base_url}/files/${response.uuid}` }); //download link (for dynamic domain after deployment)
//     });

// })

// // router.post('/send', async (req, res) => {
// //     const {uuid, emailTo, emailFrom, expiresIn} = req.body;
// //     //Validate request 
// //     if (!uuid || !emailTo || !emailFrom) {
// //         return res.status(422).send({error:'Input are missing'})
// //     }

// //     // Fetch Data from DB
// //     const file = await File.findOne({uuid:uuid});
// //     if (file.sender) { // checking same file is sent or not 
// //         return res.status(422).send({error:'mail already sent'})
// //     }

// //     file.sender = emailFrom
// //     file.receiver = emailTo
// //     const response = await file.save();

// //     //send email

// // });

// router.post('/send', async (req, res) => {
//     const { uuid, emailTo, emailFrom, expiresIn } = req.body;
//     //Validate request 
//     if (!uuid || !emailTo || !emailFrom) {
//         return res.status(422).send({ error: 'Input are missing' });
//     }
//     // Fetch Data from DB
//     // try {
//         const file = await File.findOne({ uuid: uuid });
//         if (file.sender) {
//             return res.status(422).send({ error: 'mail already sent' });
//         }
//         file.sender = emailFrom;
//         file.receiver = emailTo;
//         const response = await file.save();
//         // send mail
//         const sendMail = require('../services/emailService');
//         sendMail({
//             from: emailFrom,
//             to: emailTo,
//             subject: 'SS file sharing',
//             text: `${emailFrom} shared a file with you.`,
//             html: require('../services/emailtemplate')({
//                 emailFrom,
//                 downloadLink: `${process.env.app_base_url}/files/${file.uuid}?source=email`,
//                 size: parseInt(file.size / 1000) + ' KB',
//                 expires: '24 hours'
//             })
//         }).then(() => {
//             return res.json({ success: true });
//         }).catch(err => {
//             return res.status(500).json({ error: 'Error in email sending.' });
//         });
//     // } catch (err) {
//     //     return res.status(500).send({ error: 'Something went wrong.' });
//     // }

// });

// module.exports = router;

const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/') ,
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
              cb(null, uniqueName)
    } ,
});

let upload = multer({ storage, limits:{ fileSize: 1000000 * 100 }, }).single('myfile'); //100mb

router.post('/', (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).send({ error: err.message });
      }
        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size
        });
        const response = await file.save();
        res.json({ file: `${process.env.app_base_url}/files/${response.uuid}` });
      });
});

router.post('/send', async (req, res) => {
  const { uuid, emailTo, emailFrom, expiresIn } = req.body;
  if(!uuid || !emailTo || !emailFrom) {
      return res.status(422).send({ error: 'All fields are required except expiry.'});
  }
  // Get data from db 
  try {
    const file = await File.findOne({ uuid: uuid });
    if(file.sender) {
      return res.status(422).send({ error: 'Email already sent once.'});
    }
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();
    // send mail
    const sendMail = require('../services/mailService');
    sendMail({
      from: emailFrom,
      to: emailTo,
      subject: 'SS file sharing',
      text: `${emailFrom} shared a file with you.`,
      html: require('../services/emailtemplate')({
                emailFrom, 
                downloadLink: `${process.env.app_base_url}/files/${file.uuid}?source=email` ,
                size: parseInt(file.size/1000) + ' KB',
                expires: '24 hours'
            })
    }).then(() => {
      return res.json({success: true});
    }).catch(err => {
      return res.status(500).json({error: 'Error in email sending.'});
    });
} catch(err) {
  return res.status(500).send({ error: 'Something went wrong.'});
}

});

module.exports = router;