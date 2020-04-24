/**
 * Created by wyw on 2018/9/25.
 */
let express = require('express');
let router = express.Router();

// const multer=require('multer'); // 文件上传 第一种上传方案所需
const fs=require('fs');
// const os=require('os');
const path=require("path");
// let upload = multer({dest: './public/uploads/'});
// os.tmpdir() //跨磁盘有权限问题 第一种上传方案所需
const uploads = require('../utils/upload'); // 上传js
const utils = require('../utils/utils');

// 新路径要写真实路径，文件夹不存在multer不会主动创建
/*const uploadInmage = (req, res)=>{ // 第一种上传方案所需
    fs.rename(
        req.file.path,
        //这样弄如果没有下面这个文件路径，还是放到'./public/uploads/'
        //合成一个路径字符串，不过这里都没有用到，号好吧
        path.join('./public/uploads/' + Date.now() + '-' + req.file.originalname),
        (err)=>{
            if (err) {
                res.json({
                    code: -1,
                    data: '上传失败'
                });
                throw err;
            }
            res.json({
                code: 0,
                data: '/uploads/' + Date.now() + '-' + req.file.originalname
            });
        }
    );
};*/

// f  前端文件上传name必须为f，这是因为前端传过来的formdata里的‘f’存着文件
// router.post('/uploadFile', upload.single('f'), uploadInmage); // 第一种上传方案所需
//single单一文件
router.post('/uploadFile', uploads.uploadFile.single('f'), (req, res) => { // 第二种上传方案
    let date = utils.formatTime(new Date()).split(' ')[0];
    res.json({
        code: 0,
        //这里的filename是根据multer生成的那个，这么奇怪的吗，什么时候弄到req里面的
        data: '/uploads/' + date + '/' + req.file.filename
    });
});

module.exports = router;