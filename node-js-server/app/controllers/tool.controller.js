const db = require("../models");
const Tool = db.tool;
const ToolRequest = db.tool_request;

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
  Tool.find({ _id: req.params.id })
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
        res
          .status(200)
          .send({ message: `${results.name} has been deleted sucessfully!` });
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
  ToolRequest.find({tool: req.params.id})
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
  ToolRequest.findOneAndRemove({ _id: req.params.id})
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
