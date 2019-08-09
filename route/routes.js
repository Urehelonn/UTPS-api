var express     = require('express');
var router      = express.Router();
const newPost   = require('./api/helper/model/poster');

router.get('/abc',(req, res, next) =>{
    res.send('test success');
})
router.post('/addpost',(req, res, next) =>{
    res.send('add  success');
    let newposterItem = new newPost({
        location: req.body.location,
        picture: req.body.picture,
        content: req.body.content
    });
    newposterItem.save((err, item) =>{
        if(err){
            res.json(err)
        }
        else{
            res.json({msg: 'Item has been added'});
        }
    })
})
module.exports = router;