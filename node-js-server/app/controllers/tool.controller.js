const db = require("../models");
const Tool = db.tool

exports.tools = (req, res) => {
    Tool.find().populate("owner", "username").then( tools => {
      res.status(200).send({tools: tools});
    }).catch( err => {
      res.status(500).send({message: err});
    });
};

exports.add = (req, res) => {
    const tool = new Tool({
        name: req.body.name,
        manufacturing_date: req.body.manufacturing_date,
        status: req.body.status,
        max_time_borrow: req.body.max_time_borrow,
        categories: req.body.categories,
        producer: req.body.producer,
        owner: req.body.owner,
        description: req.body.description || '',
      });
    
      tool.save().then( new_tool => {
        res.status(200).send({ message: "Tool was added successfully!" });
        return;
      }).catch( err => {
        res.status(500).send({ message: err });
        return;
      });
  };