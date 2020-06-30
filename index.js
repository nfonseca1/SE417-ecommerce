var express = require("express");
var sql = require("mssql");
var app = express();

app.set('views', __dirname);
app.use(express.static(__dirname));
app.engine('ejs', require('ejs').__express);
app.use(express.json());
app.use(express.urlencoded());

var config = {  
	user: 'SE417_Nathan',
	password: 'Fonseca',
    server: 'sql.neit.edu',
    port: 4500,
    database: 'SE417_Nathan'
};

sql.connect(config, err => {
	if (err) console.log(err);
})

app.get("/", function(req, res){
	res.render("index.ejs", {registerError: "", loginError: ""});
})

app.post("/", function(req, res){
	var request = new sql.Request();
	request.query(`select * from Users where Email='${req.body.email}' or Username='${req.body.username}'`, (err, result) => {
		if (err) console.log(err);
		else if (result.recordset.length > 0) {
			res.render("index.ejs", {registerError: "Email or username has already been used for an account", loginError: ""})
		}
		else {
			request.query(`insert into Users (Email, Password, Username, Firstname, Lastname) values 
				('${req.body.email}', '${req.body.password}', '${req.body.username}', '${req.body.firstname}', '${req.body.lastname}')`, (err2, result2) => {
					if (err2) console.log(err2);
					else {
						res.send(result2);
					}
				})
		}
	})
})

app.get("/home", function(req, res){
	var request = new sql.Request();
	var products = [];
	request.query('SELECT TOP 10 * FROM Products', (err, result) => {
		if (err) console.log(err);
		else {
			var count = 0;
			result.recordset.forEach(rec => {
				request.query(`select * from Users where Id=${rec.SellerId}`, (err2, result2) => {
					if (err2) console.log(err2);
					else {
						var obj = rec;
						obj.Seller = result2.recordset[0].Username;
						products.push(obj);
					}
					count++;
					if (count === result.recordset.length) res.render("home.ejs", {products: products});
				})
			})
		}
	})
})

app.post("/home", function(req, res){
	var request = new sql.Request();
	request.query(`select * from Users where email='${req.body.email}' and password='${req.body.password}'`, (err, result) => {
		if (err) console.log(err);
		else if (result.recordset.length > 0) {
			res.send(result);
		}
		else {
			res.render("index.ejs", {registerError: "", loginError: "Email or password is incorrect"})
		}
	})
})

app.listen(3000, function(){
	console.log("server started...");
})