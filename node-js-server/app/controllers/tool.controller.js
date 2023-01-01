const db = require("../models");
const Tool = db.tool
const ToolRequest = db.tool_request;

exports.tools = (req, res) => {
    Tool.find().populate("owner", "username").then( tools => {
      res.status(200).send({tools: tools});
    }).catch( err => {
      res.status(500).send({message: err});
    });
};

exports.tool_by_id = (req, res) => {
    Tool.find({_id: req.params.id}).populate("owner", {username: 1, fname: 1, lname: 1}).then( tool => {
        res.status(200).send({tool: tool});
      }).catch( err => {
        res.status(500).send({message: err});
      });
}

exports.delete_by_id = (req, res) => {
    
    Tool.findOneAndRemove({_id: req.params.id, owner: {_id: req.userId}}).then( results => {
      if(results){
        res.status(200).send({message: `${results.name} has been deleted sucessfully!`});
      } else {
        res.status(401).send({message: "Tool was not found"});
      }
        
      }).catch( err => {
        res.status(500).send({message: err});
      });
}

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

  exports.request = (req, res) => {

    const tool_request = new ToolRequest({
        // status: req.body.status,  defaule pending
        borrow_duration: req.body.borrow_duration,
        expiration_date: new Date(req.body.expiration_date),  // formatted like: "YYYY-MM-DD"
        start_date: new Date(),
        tool: req.body.tool,
        requestor: req.body.requestor,
      });
    
      tool_request.save().then( new_tool_request => {
        res.status(200).send({ message: "Tool request was added successfully!" });
        return;
      }).catch( err => {
        res.status(500).send({ message: err });
        return;
      });
  };