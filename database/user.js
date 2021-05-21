const mongoose=require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type : String,
    required: true,
    min: [8, 'Minimum 8 characters are required'],
  }
})


UserSchema.methods.comparePassword = function(password){
  return new Promise((res, rej) =>{
    bcrypt.compare(password, this.password, (err, same) =>{
      if(err){
        rej(err)
      }
      else {
        res(same)
      }
    })
  })
}

UserSchema.statics.createUser = function(username, password){
    return new Promise((resolve,reject)=>{
      bcrypt.hash(password,10)
        .then(hashedPassword=>{
          const newUser= new User({
            password:hashedPassword,
            username
          })
          newUser.save()
            .then(user=>{
              resolve(user)
            })
            .catch(err=>{reject(err)}) //if user  not saved
        })
        .catch(err=>{reject(err)}) //if password not hashed
    })

  }


const User = new mongoose.model('User',UserSchema);
module.exports= {User}
