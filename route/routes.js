var express     = require('express');
var router      = express.Router();
const newPost   = require('../api/helper/model/poster');

router.get('/abc',(req, res, next) =>{
    res.send('test success');
})
router.post('/addpost',(req, res, next) =>{
    console.log('add  success',res);
    // res.send('add  success',req);
    let newposterItem = new newPost({
        location: req.body.location,
        pictures: req.body.pictures,
        content: req.body.content
    });
    newposterItem.save((err, item) =>{
        if(err){
            console.log(err);
        }
        else{
            res.json({msg: 'Item has been added'});
        }
    })
})
module.exports = router;