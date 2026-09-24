const {getCollection}=require("../lib/mongodb");const {setCors,handleOptions,requireApiKey,parseYear,parseQuarter,buildPeriodFilter,normalizeDoc}=require("../lib/api");
module.exports=async function(req,res){setCors(res);if(handleOptions(req,res))return;if(req.method!=="GET")return res.status(405).json({ok:false,error:"Method not allowed"});if(!requireApiKey(req,res))return;
try{const year=parseYear(req.query.year),quarter=parseQuarter(req.query.quarter);const docs=await (await getCollection()).find(buildPeriodFilter(year,quarter)).limit(5000).toArray();const m=new Map();
for(const d of docs.map(normalizeDoc)){const k=d.branch.code||d.branch.name;if(k&&!m.has(k))m.set(k,{code:d.branch.code,name:d.branch.name})}
res.status(200).json({ok:true,filters:{year,quarter},count:m.size,data:[...m.values()].sort((a,b)=>(a.name||"").localeCompare(b.name||"","th"))})}
catch(e){console.error(e);res.status(500).json({ok:false,error:e.message})}};
