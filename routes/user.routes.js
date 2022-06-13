const Router = require('express').Router()
const User = require('../models/user.model')
const Category = require('../models/category.model')
const Transaction = require('../models/transaction.model')


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
        if(user === null || user === undefined){
            res.status(404).json(`Sorry no users found !!`)
        }
        else{
            res.json(user)
        }
    })
    .catch(err=>res.status(400).json('Error occured . . .'))
})



//--------------------------------------------------------------------
//POST ROUTES
//--------------------------------------------------------------------

//Add an user
Router.post('/', (req, res)=>{
    const {name, username, email, password} = req.body
    
    const newUser = new User({name, username, email, password})

    newUser
    .save()
    .then(()=> res.json(`Added user ${username}`))
    .catch(err=> res.json(`Error occured: ${err}`))
})




//--------------------------------------------------------------------
//PATCH ROUTES
//--------------------------------------------------------------------

//update an user
Router.patch('/:username', (req, res)=>{
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



//--------------------------------------------------------------------
//DELETE ROUTES
//--------------------------------------------------------------------

//delete an user
Router.delete('/:username', (req, res)=>{
    const {username} = req.params
    
    //Deleting the user
    User
    .findOneAndDelete({username: username})
    .then(async(user)=>{

        //Deleting User categories
        user.categories.map(async(category)=>{
            await Category
            .findOneAndDelete({_id: category})
        })

        //Deleting user transactions
        user.transactions.map(async(transaction)=>{
            await Transaction.findOneAndDelete({_id: transaction})
        })

        res.json(`Successfully Deleted User items`)

    })
    .catch(err => res.status(400).json(err))
})

module.exports = Router