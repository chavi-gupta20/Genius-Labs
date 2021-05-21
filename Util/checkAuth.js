const jwt = require ('jsonwebtoken')

const verifyToken = (token) => {
  const key = "Paritosh"
  return new Promise((resolve, reject) => {
    jwt.verify(token, key , (err, data) => {
      if(err){
        reject(err)
      }
      resolve(data)
    })
  })
}
exports.checkAuth = (req, res, next) => {
  if(req.cookies.token!==undefined)
  {
    const token=req.cookies['token']
    verifyToken(token)
    .then(data=>{
      req.user=data
      next()
    })
  }
  else
  {
    next()
  }
}

exports.generateAccessToken = (payload) =>{
    const key = "Paritosh"
    return jwt.sign(payload, key)
}
