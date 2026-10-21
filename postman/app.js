const express=require("express");
const student=[
    {id:1,name:"Jason"},
    {id:2,name:"Amaresh"}
]


const app=express();
const cors=require("cors");
app.use(cors());
app.use(express.json());

app.get("/students",(req,res)=>{
    res.json(student);
    console.log("sent");

});
app.listen(5000,()=>{
    console.log("server is running on port 5000");
})

app.post("/students",(req,res)=>{
    student.push({id:req.body.id,name:req.body.name});
        res.status(201).json({
        message: "Student added successfully",
        student: req.body
    });
})

app.put("/students/:id",(req,res)=>{
    const id=Number(req.params.id);
    const s=student.find(s=>s.id==id);
    if(!s) return res.status(404).send("data not found");
    s.name=req.body.name;
    res.json(s);
})

app.delete("/students/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = student.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json("not found");
    }

    student.splice(index, 1);
    res.json("done");
});