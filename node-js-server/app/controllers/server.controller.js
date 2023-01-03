const db = require("../models");
const ToolRequest = db.tool_request;
const User = db.user;
const Tool = db.tool;

exports.closeExpiredPendingRequests = async function run() {

    const now = new Date();
    try {
      const res = await ToolRequest.updateMany({status: 'pending', expiration_date: {$lte: now}}, {$set: {status: 'closed'}});
      if(res.nModified > 0){
        console.log(`Closed ${res.nModified} requests successfully at ~${now}`);
      }

    } catch (err) {
      console.error(`Something went wrong: ${err}`);
    }
  };

exports.closeExpiredApprovedRequests = async function run() {

    const now = new Date();
    try {
      const res = await ToolRequest.findOneAndUpdate({status: 'approved', expiration_date: {$lte: now}}, {$set: {status: 'closed'}}).populate("requestor").populate("tool");

      if(res){
        const username = res.requestor.username;
        const tool_name = res.tool.name;
        console.log(`Closed ${username} request for ${tool_name} successfully`);

        const negative_rank_borrower = await User.findOneAndUpdate({_id: res.requestor._id}, { $inc: { rank: -1 } });
            if (negative_rank_borrower){
                const prev_rank = negative_rank_borrower.rank;
                console.log(`Decreased ${username} rank from ${prev_rank} to ${prev_rank - 1} successfully`);

                const tool = await Tool.findOneAndUpdate({_id: res.tool._id}, {status: 'available'});
                if(tool){
                    console.log(`Tool ${tool_name} status has changed to 'available'`);
                } 
                else {
                    console.log(`Tool ${tool_name} was not found`);
                }
            }
            else {
                console.log(`User ${res.username} was not found`);
            }
        
      }

    } catch (err) {
      console.error(`Something went wrong: ${err}`);
    }
  };
