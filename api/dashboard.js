const {getCollection}=require("../lib/mongodb");const {setCors,handleOptions,requireApiKey,parseYear,parseQuarter,normalizeDoc,buildPeriodFilter,addBranchFilter}=require("../lib/api");
module.exports=async function(req,res){setCors(res);if(handleOptions(req,res))return;if(req.method!=="GET")return res.status(405).json({ok:false,error:"Method not allowed"});if(!requireApiKey(req,res))return;
try{const year=parseYear(req.query.year),quarter=parseQuarter(req.query.quarter),branch=req.query.branch||null,branchCode=req.query.branchCode||null;
if(req.query.year&&year===null)return res.status(400).json({ok:false,error:"year is invalid"});if(req.query.quarter&&quarter===null)return res.status(400).json({ok:false,error:"quarter must be 1-4"});
let f=addBranchFilter(buildPeriodFilter(year,quarter),branch,branchCode);const docs=await (await getCollection()).find(f).sort({"branch.name":1}).limit(5000).toArray();
res.status(200).json({ok:true,filters:{year,quarter,branch,branchCode},count:docs.length,data:docs.map(normalizeDoc)})}
catch(e){console.error(e);res.status(500).json({ok:false,error:e.message})}};
