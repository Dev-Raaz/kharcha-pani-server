const Category = require('../models/category.model')
const User = require('../models/user.model')
const Transaction = require('../models/transaction.model')

const createCategory = async(name, type, username, res = null) => {

    let createdUser = null

    //Find user and update
    User.findOne({username: username})
    .then(user=>{

        //creating new category
        const newCategory = new Category({
            name: name,
            type: type,
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
            .then(user=> {
                if(res != null){
                    
                }
                    
            })
            .catch(err => {
                if(res != null)
                res.status(400).json(`Error occured: ${err}`)
                else 
                 throw err
            })

        })
        .catch(err=> {
            if(res != null)
            res.status(400).json(`Error occured: ${err}`)
            else 
             throw err 
        })
        
    })
    .catch(err=>{
        if(res != null)
        res.status(400).json(`Error occured: ${err}`)
        else 
         throw err
    })
}

module.exports = {
    createCategory
}