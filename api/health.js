const {getCollection}=require("../lib/mongodb");const {setCors,handleOptions,requireApiKey}=require("../lib/api");
module.exports=async function(req,res){setCors(res);if(handleOptions(req,res))return;if(req.method!=="GET")return res.status(405).json({ok:false,error:"Method not allowed"});if(!requireApiKey(req,res))return;
try{const c=await getCollection();await c.findOne({}, {projection:{_id:1}});res.status(200).json({ok:true,mongodb:"connected",timestamp:new Date().toISOString()})}
catch(e){console.error(e);res.status(500).json({ok:false,mongodb:"error",error:e.message})}};
