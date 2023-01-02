const db = require("../models");
const Tool = db.tool;
const ToolRequest = db.tool_request;
const User = db.user;

exports.tools = (req, res) => {
  Tool.find()
    .populate("owner", "username")
    .then((tools) => {
      if (!tools) {
        res.status(401).send({ message: "Tools was not found" });
        return;
      } else {
        res.status(200).send({ tools: tools });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
};

exports.tool_by_id = (req, res) => {
  Tool.findOne({ _id: req.params.id })
    .populate("owner", { username: 1, fname: 1, lname: 1 })
    .then((tool) => {
      if (!tool) {
        res.status(401).send({ message: "Tool was not found" });
        return;
      } else {
        res.status(200).send({ tool: tool });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
};

exports.delete_by_id = (req, res) => {
  Tool.findOneAndRemove({ _id: req.params.id, owner: { _id: req.userId } })
    .then((results) => {
      if (results) {
        ToolRequest.deleteMany({ tool: results.id }).then((_) => {
          res
            .status(200)
            .send({ message: `${results.name} has been deleted sucessfully!` });
        });
      } else {
        res.status(401).send({ message: "Tool was not found" });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err });
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
    description: req.body.description || "",
  });

  tool
    .save()
    .then((new_tool) => {
      res.status(200).send({ message: "Tool was added successfully!" });
      return;
    })
    .catch((err) => {
      res.status(500).send({ message: err });
      return;
    });
};

exports.request = (req, res) => {
  const tool_request = new ToolRequest({
    // status: req.body.status,  defaule pending
    content: req.body.content,
    borrow_duration: req.body.borrow_duration,
    expiration_date: new Date(req.body.expiration_date), // formatted like: "YYYY-MM-DD"
    date: new Date(),
    tool: req.params.id,
    requestor: req.body.requestor,
  });

  tool_request
    .save()
    .then((new_tool_request) => {
      res.status(200).send({
        message: "Tool request was added successfully!",
        request: new_tool_request,
      });
      return;
    })
    .catch((err) => {
      res.status(500).send({ message: err });
      return;
    });
};

exports.requests = (req, res) => {
  ToolRequest.find()
    .populate("tool")
    .populate("requestor")
    .then((requests) => {
      if (!requests) {
        res.status(401).send({ message: "Tools requests was not found" });
        return;
      } else {
        res.status(200).send({ requests: requests });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
};

exports.tool_requests = (req, res) => {
  ToolRequest.find({ tool: req.params.id })
    .populate("tool")
    .populate("requestor")
    .then((requests) => {
      if (!requests) {
        res.status(401).send({ message: "Tools requests was not found" });
        return;
      } else {
        res.status(200).send({ requests: requests });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
};

exports.delete_request = (req, res) => {
  ToolRequest.findOneAndRemove({ _id: req.params.id, status: "pending" })
    .then((results) => {
      if (results) {
        res
          .status(200)
          .send({ message: "Request has been deleted sucessfully!" });
      } else {
        res.status(401).send({ message: "Request was not found" });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
};

exports.update_request = (req, res) => {
  update = {};
  filter = { _id: req.params.id, status: "pending" };
  changable_properties = ["content", "borrow_duration", "expiration_date"];

  for (elem in changable_properties) {
    if (req.body[elem] !== undefined) {
      update[elem] = req.body[elem];
    }
  }

  ToolRequest.findOneAndUpdate(filter, update, {new: true})
    .then((request) => {
      if (request) {
        res
          .status(200)
          .send({ message: "Request has been updated sucessfully!", request: request });
      } else {
        res.status(401).send({ message: "Request was not found", request: request });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
};

exports.update_request_status = (req, res) => {
  update = { 
    status: req.body.status,
    expiration_date: req.body.expiration_date 
  };
  filter = { _id: req.params.id, status: { $in: ["approved", "pending"] }};
  update_tool = {status: req.body.status === "approved" ? "not available" : "available"};
  tool_filter = {status: req.body.status === "approved" ? "available" : "not available"}

  ToolRequest.findOneAndUpdate(filter, update, {new: true})
    .then((request) => {
      if (request && req.body.status === "rejected") {
        res
          .status(200)
          .send({ message: "Request has been updated sucessfully!", request: request});
      } else if (request) {
        tool_filter._id = request.tool;
        
        Tool.findOneAndUpdate(tool_filter, update_tool).then(
          (results) => {
            if (results) {
              res
                .status(200)
                .send({ message: "Request has been updated sucessfully!", request: request });
            } else {
              res.status(401).send({ message: "Request's tool was not found" });
            }
          }
        );
      } else {
        res.status(401).send({ message: "Request was not found" });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
};

exports.request_feedback = (req, res) => {
  ToolRequest.findOne({_id: req.body.request_id}).populate("tool").then( request => {
    inc = (req.body.feedback) ? 1 : -1;
    initiator_id = req.body.id;
    if(!request){
      res.status(401).send({ message: "Request was not found" });
    } else {
      tool_owner_id = request.tool.owner._id;
      is_owner_initiate = tool_owner_id == initiator_id;      

      if(is_owner_initiate && !request.owner_feedback){
        update_request = {owner_feedback: true};
        user_filter = {_id: request.requestor};
      } else if (!is_owner_initiate && !request.my_feedback){
        update_request = {my_feedback: true};
        user_filter = {_id: tool_owner_id};
      } else {
        res.status(401).send({ message: "You can update feedback one per loan" });
      }
      ToolRequest.findOneAndUpdate(request.id, update_request, {new: true}).then( request => {
        User.findOneAndUpdate(user_filter, {$inc: {rank: inc}}).then( _ => {
          res
          .status(200)
          .send({ message: "User have beed ranked successfully", request: request});
        })
      })
    }
  }).catch( err => {
    res.status(500).send({ message: err });
  });
};
