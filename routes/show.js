const router = require('express').Router();
const File = require('../models/file');

router.get('/:uuid', async (req, res) => { //for uniqueness of download link we are using uuid 
    try { 
        const file = await File.findOne({uuid: req.params.uuid}); // now we are fetching particular row from dbs with compariosion betn db-uuid with req-uuid

        if(!file) {
            return res.render('download', {error: 'Ask sender to provide valid link'});
        }

        return res.render('download', {
            uuid: file.uuid,
            fileName: file.fileName,
            fileSize: file.fileSize,
            download: `${process.env.app_base_url}/files/download/${file.uuid}`
        });

    } catch(err) {
        return res.render('download', {error: 'Ask sender to provide valid link'});
    }
});


module.exports = router;