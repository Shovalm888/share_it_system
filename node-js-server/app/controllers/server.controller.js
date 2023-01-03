const db = require("../models");
const ToolRequest = db.tool_request;
const User = db.user;

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
      const res = await ToolRequest.findOneAndUpdate({status: 'approved', expiration_date: {$lte: now}}, {$set: {status: 'closed'}}).populate("requestor");
      if(res){
        const negative_rank_borrower = await User.findOneAndUpdate({_id: res.requestor._id}, { $inc: { rank: -1 } });
            if (negative_rank_borrower){
                const prev_rank = negative_rank_borrower.rank;
                const username = negative_rank_borrower.username;

                console.log(`Closed ${username} requests successfully his rank decreased from ${prev_rank} to ${prev_rank - 1}`);
            }
            else {
                console.log(`User ${res.username} was not found`);
            }
        
      }

    } catch (err) {
      console.error(`Something went wrong: ${err}`);
    }
  };
