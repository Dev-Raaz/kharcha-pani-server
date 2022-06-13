const Router = require('express').Router()
const Category = require('../models/category.model')
const User = require('../models/user.model')
const Transaction = require('../models/transaction.model')
const mongoose = require('mongoose')


//--------------------------------------------------------------------
//GET ROUTES
//--------------------------------------------------------------------

//Get All categories
Router.get('/', (req, res)=>{
    Category
    .find()
    .then(categories=>res.json(categories))
    .catch(err=>res.status(400).json(`Error found: ${err}`))
})

//Get Specific category
Router.get('/:catid', (req, res)=>{
    const {catid} = req.params
    
    Category
    .findOne({_id: catid})
    .then(category=> res.json(category))
    .catch(err=> res.status(400).json(`Error: ${err}`))

    
})



//--------------------------------------------------------------------
//POST ROUTES
//--------------------------------------------------------------------

//Add A category
Router.post('/', async(req, res)=>{

    //Body should have a name, type and an username
    const {name, type, username} = req.body
    
    //Find user and update
    User.findOne({username: username})
    .then(user=>{

        //creating new category
        const newCategory = new Category({
            name: name,
            type: type,
            user: user.id
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




//--------------------------------------------------------------------
//UPDATE ROUTES -------------------------------------------------------
//--------------------------------------------------------------------

//update a category
Router.patch('/:catid', (req, res)=>{
    const {catid} = req.params
    const {name, type} = req.body

    Category
    .findOneAndUpdate({_id: catid}, {
        name: name,
        type: type
    }, {new: true})
    .then(category => res.json(category))
    .catch(err => res.status(400).json(`Error: ${err}`))

})



//--------------------------------------------------------------------
//DELETE ROUTES
//--------------------------------------------------------------------

//Deleting a category
Router.delete('/:catid', async(req, res)=>{
    const {catid} = req.params

    Category
    .findOneAndDelete({_id: catid})
    .then(async(category) => {

        //Guard Statement
        if(category === null || category === undefined)
            return

        //Finding the user
        const catUser = await User.findOne({_id: category.user})
        

        //Filtering User Categories
        const userCategories = catUser.categories.filter(cid => {
            return (cid.toString() !== category._id.toString())
        }) 


        //Filtering User Transactions
        let userTransactions = catUser.transactions
        if(category.transactions.length > 0){
            category.transactions.map(tid => {
                userTransactions = userTransactions.filter(TID => TID.toString() !== tid.toString())
            })
        }

        //Deleting the user category and related transactions
        const uResponse = await User.findOneAndUpdate({_id: category.user}, {
            categories: userCategories,
            transactions: userTransactions
        }, {new: true})

        
        //Deleting the transactions
        await category.transactions.map(async(tId) => {
            await Transaction.findOneAndDelete({_id: tId})
        }) 

        res.json({
            uResponse: uResponse,
            cResponse: category,
            msg: 'Deleted the transactions and updated user'
        })
        
    })
    .catch(err => res.status(400).json(err))
    
})

module.exports = Router