const Router = require('express').Router()
const Transaction = require('../models/transaction.model')
const User = require('../models/user.model')
const Category = require('../models/category.model')


//--------------------------------------------------------------------
//GET ROUTES
//--------------------------------------------------------------------

//Get All transactions
Router.get('/', (req, res)=>{
    Transaction
    .find()
    .then(transactions => res.json(transactions))
    .catch(err => res.status(400).json(`Error in getting all transactions: ${err}`))
})

//Get Specific transaction
Router.get('/:tid', (req, res)=>{
    const {tid} = req.params
    
    Transaction
    .findOne({_id: tid})
    .then(transaction => {
        if(transaction === null || transaction === undefined){
            res.status(404).json(`Not Found`)
        }else{
            res.json(transaction)
        }
    })
    .catch(err => res.status(400).json(`Error in finding the transaction ${err}`))
})



//--------------------------------------------------------------------
//POST ROUTES
//--------------------------------------------------------------------

//Add A transaction
Router.post('/', async(req, res)=>{
    const {title, amount, description, imgSrc, user, category} = req.body

    //Getting the user and category for the transaction
    const tUser = await User.findOne({username: user})
    const tCategory = await Category.findOne({_id: category})

    //Creating a new transaction
    const newTransaction = new Transaction({
        title: title,
        amount: amount,
        description: description === null || description === "" ? "" : description,
        imgSrc: imgSrc === null || imgSrc === "" ? "" : imgSrc,
        user: tUser._id,
        category: category
    })

    try{
        const tResponse = await newTransaction.save()
        const uResponse = await User.findOneAndUpdate({username: user},{
            transactions: [...tUser.transactions, tResponse._id]
        }, {new: true})
        const cResponse = await Category.findOneAndUpdate({_id: category},{
            transactions: [...tCategory.transactions, tResponse._id]
        }, {new: true})

        res.json({
            tResponse: tResponse,
            uResponse: uResponse,
            cResponse: cResponse
        })
        
    }
    catch(err){
        res.status(400).json(err)
    }
    
})




//--------------------------------------------------------------------
//PATCH ROUTES
//--------------------------------------------------------------------

//update a user
Router.patch('/:tid', (req, res)=>{
    const {tid} = req.params

    const {title, amount, description, imgSrc} = req.body

    Transaction
    .findOneAndUpdate({_id: tid},{
        title: title,
        amount: amount,
        description: description,
        imgSrc: imgSrc
    }, {new: true})
    .then(transaction => res.json(transaction))
    .catch(err => res.status(400).json(`Error occured while updating transaction: ${err}`))
    
})



//--------------------------------------------------------------------
//DELETE ROUTES
//--------------------------------------------------------------------

//delete a user
Router.delete('/:tid', (req, res)=>{
    const {tid} = req.params

    Transaction.findOneAndDelete({_id: tid})
    .then(async(transaction)=>{
        const tUser = await User.findOne({_id: transaction.user})
        const tCategory = await Category.findOne({_id: transaction.category})

        //Filtering User Transactions
        const userTransactions = tUser.transactions.filter(tid => {
            return (tid.toString() !== transaction._id.toString())
        }) 

        const catTransactions = tCategory.transactions.filter(tid => {
            return (tid.toString() !== transaction._id.toString())
        })

        const uResponse = await User.findOneAndUpdate({_id: transaction.user},{
            transactions: userTransactions
        }, {new: true})

        const cResponse = await Category.findOneAndUpdate({_id: transaction.category}, {
            transactions: catTransactions
        }, {new: true})


        //Sending the response
        res.json({
            uResponse: uResponse,
            cResponse: cResponse,
            tResponse: transaction
        })
    })
    .catch(err => res.status(400).json(err))
})

module.exports = Router