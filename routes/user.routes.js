const Router = require('express').Router()
const User = require('../models/user.model')
const Category = require('../models/category.model')
const Transaction = require('../models/transaction.model')
const emailjs = require('@emailjs/browser')
const nodemailer = require('nodemailer')

//utils
//const {createCategory} = require('../utils/categoryUtils')



//--------------------------------------------------------------------
//GET ROUTES
//--------------------------------------------------------------------

//Get all users
Router.get('/', (req, res)=>{
    User.find()
    .then(users=> res.json(users))
    .catch(err=> res.json(false))
})

//Get specific user
Router.get('/:username', (req, res)=>{
    const {username} = req.params
    
    //Finding One user
    User
    .findOne({username: username})
    .then(user=>{
            res.json(user)
    })
    .catch(err=>res.status(400).json('Error occured . . .'))
})


//Get specific user with email
Router.get('/email/:email', (req, res)=>{
    const {email} = req.params
    
    //Finding One user
    User
    .findOne({email: email})
    .then(user=>{
            res.json(user)
    })
    .catch(err=>res.status(400).json('Error occured . . .'))
})




//--------------------------------------------------------------------
//POST ROUTES
//--------------------------------------------------------------------

//Add an user
Router.post('/', async(req, res)=>{
    const {name, username, email, password} = req.body
    
    const newUser = new User({name, username, email, password})

    newUser
    .save()
    .then(async()=> {
    
    //ADDING two default categories . . .
    //First update    
    User.findOne({username: username})
    .then(user=>{

        //creating new category
        const newCategory = new Category({
            name: 'Food',
            type: 'expense',
            user: user._id
        })

        //Adding a category
        newCategory
        .save()
        .then((cat)=>{

            //Updating user
            User.findOneAndUpdate({_id: user._id},{
                categories: [...user.categories, cat._id]
            }, {new: true})    
            .then(()=>{

                //Second time
                User.findOne({username: username})
                    .then(user=>{

                        //creating new category
                        const newCategory = new Category({
                            name: 'Salary',
                            type: 'income',
                            user: user._id
                        })

                        //Adding a category
                        newCategory
                        .save()
                        .then((cat)=>{

                            //Updating user
                            User.findOneAndUpdate({_id: user._id},{
                                categories: [...user.categories, cat._id]
                            }, {new: true})    
                            .then(user=>res.json(user))

                        })
                        .catch(err=>console.log(`Error occured: ${err}`))
                        
                    })
                    .catch(err=>{
                        res.status(400).json(`An error occured: ${err}`)
                    })
            })

        })
        .catch(err=>console.log(`Error occured: ${err}`))
        
        })
        .catch(err=>{
        res.status(400).json(`An error occured: ${err}`)
        })
    })
    .catch(err=> res.json(`Error occured: ${err}`))
})

//Verify OTP
Router.post('/email/:email/verify', (req,res)=>{

    const {email} = req.params

    const user = User.findOne({email: email})

    const {otp} = req.body
    if(user == null){
        res.status(400).json(`No user found with this email . . .`)
        return
    }

    // const templateParams = {
    //     from_name: 'Kharcha Pani App',
    //     notes: 'Check this out!',
    //     message: otp,
    //     to_email: email,
    //     reply_to: 'kharchapanibiz@gmail.com'
    // };
    
    // console.log('Sending OTP . . .')
    // emailjs.send('service_dsfas2b','template_jjnnpfw', templateParams, 'SPdwyA8uk1Sx3mDu5')
    //     .then((response) => { 
    //        res.send(response.text)
    //        console.log(response.text)
    //     }, (err) => {
    //        res.status(400).json(err)
    //        console.log(err)
    //     });

    var smtpTransport = nodemailer.createTransport({
        service: "outlook",
        auth: {
            user: "kharchapanibiz@outlook.com",
            pass: "Debraj14#$@"
        }
    });

    var mailOptions = {
        from: 'kharchapanibiz@outlook.com',
        to: email, 
        subject: 'Here is your OTP !',
        text: `${otp}`
    }

    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            res.status(400).json(error)
        }else{
            res.json(response.accepted[0]);
        }
    });

})



//--------------------------------------------------------------------
//PATCH ROUTES
//--------------------------------------------------------------------

//update an user
Router.patch('/:username/all', (req, res)=>{
    const {username} = req.params
    const {name, password, email} = req.body

    User.findOneAndUpdate({username: username},{
        name: name,
        password: password,
        email: email
    }, {new: true})
    .then(user => res.json(user))
    .catch(err => res.status(400).json(err))
})

//update password user
Router.patch('/:username', (req, res)=>{
    const {username} = req.params
    const {password} = req.body

    //Updating the password
    User.findOneAndUpdate({username: username},{
        password: password
    }, {new: true})
    .then(user => res.json(user))
    .catch(err => res.status(400).json(err))
})

//update password by email
Router.patch('/email/:email', (req, res)=>{
    const {email} = req.params
    const {password} = req.body

    //Updating the password
    User.findOneAndUpdate({email: email},{
        password: password
    }, {new: true})
    .then(user => res.json(user))
    .catch(err => res.status(400).json(err))
})

//--------------------------------------------------------------------
//DELETE ROUTES
//--------------------------------------------------------------------

//delete an user
Router.delete('/:username', (req, res)=>{
    const {username} = req.params
    
    //Deleting the user
    User
    .findOneAndDelete({username: username})
    .then((user)=>{

        //Deleting User categories
        user.categories.map(async(category)=>{
            await Category
            .findOneAndDelete({_id: category})
        })

        //Deleting user transactions
        user.transactions.map(async(transaction)=>{
            await Transaction.findOneAndDelete({_id: transaction})
        })

        res.json(user)

    })
    .catch(err => res.status(400).json(err))
})

module.exports = Router