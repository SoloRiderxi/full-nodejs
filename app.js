const path = require('path')
const express = require('express')
const mogoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphs = require('express-handlebars')
const connectDB = require('./config/db')
const passport = require('passport')
const session = require('express-session')
const MongoStore= require('connect-mongo')
const methodOverride= require('method-override')


//Load config
dotenv.config({path: './config/config.env'})

//pass config
require('./config/passport')(passport)

connectDB()

const app = express()

//Body parser
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//override method
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
)

//Morgan log
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'))
}

//Handlerbars helper calling methods
const {formatDate, truncate, stripTags, editIcon,select} = require('./helper/hbs')

//Handlebars extention, method(helper) and layouts
app.engine('.hbs', exphs.engine({
helpers:{formatDate, truncate, stripTags, editIcon,select},
defaultLayout: 'main', extname:'.hbs'}))
app.set('veiw engine', '.hbs')

//session
app.use(session({
	secret: 'keyboard cat',
	reverse: false,
	saveUninitialized: false,
	store: MongoStore.create({mongoUrl: process.env.MONGO_URI,})
}))

//passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Globel varaible
app.use((req,res,next)=>{
	res.locals.user=req.user||null
	next()
})

//Static folder
app.use(express.static(path.join(__dirname,'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT= process.env.PORT || 3000


app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT} `))