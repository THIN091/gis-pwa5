const {getCollection}=require("../lib/mongodb");const {setCors,handleOptions,requireApiKey,buildPeriodFilter}=require("../lib/api");
module.exports=async function(req,res){setCors(res);if(handleOptions(req,res))return;if(req.method!=="GET")return res.status(405).json({ok:false,error:"Method not allowed"});if(!requireApiKey(req,res))return;
try{const c=await getCollection(),data=[];for(let y=2565;y<=2569;y++)for(let q=1;q<=4;q++){const count=await c.countDocuments(buildPeriodFilter(y,q));data.push({year:y,quarter:q,count,hasData:count>0})}
res.status(200).json({ok:true,years:[2565,2566,2567,2568,2569],data})}catch(e){console.error(e);res.status(500).json({ok:false,error:e.message})}};
