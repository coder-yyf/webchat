const apiModel = require("../model/apiModel");

const getTodoList = (req, res) => {
    apiModel.getTodoList({userName: req.session.login}, (r) => { // 查询日程
        res.json(r);
    })
};
const addTodo = (req, res) => {
    let params = req.body;
    //因为用的是json对象，所以要拆开来
    apiModel.addTodo({userName: req.session.login, ...params}, (r) => { // 添加日程
        res.json(r);
    })
};
const upTodo = (req, res) => {
    let params = req.body;
    apiModel.upTodo(params, (r) => { // 修改日程
        res.json(r);
    })
};
const delTodo = (req, res) => {
    let params = req.body;
    apiModel.delTodo(params, (r) => { // 删除日程
        res.json(r);
    })
};

module.exports = {
    getTodoList,
    addTodo,
    upTodo,
    delTodo
};