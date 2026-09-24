const {getCollection}=require("../lib/mongodb");
const {setCors,handleOptions,requireApiKey,normalizeDoc}=require("../lib/api");
module.exports=async function(req,res){
  setCors(res); if(handleOptions(req,res)) return;
  if(req.method!=="GET") return res.status(405).json({ok:false,error:"Method not allowed"});
  if(!requireApiKey(req,res)) return;
  try{
    const docs=await (await getCollection()).find({}).sort({fiscal_year:1,quarter:1,"branch.name":1}).limit(10000).toArray();
    res.status(200).json({ok:true,count:docs.length,data:docs.map(normalizeDoc)});
  }catch(e){console.error(e);res.status(500).json({ok:false,error:e.message});}
};
