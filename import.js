var lineReader = require('line-reader')
var low = require('lowdb')
var uuid = require('node-uuid')
var _ = require('underscore')
var url = require('url')

// hardcoded for POC
var dbPassword = 'test'

// hardcoded for POC
var pifPath = '/Volumes/HDD/Users/matteocrippa/Desktop/data.1pif'

// We have to enter 1pif directory and search for data.1pif file

var db = low('grimorio.pwger', {
  encrypt: true,
  passkey: dbPassword
})

db('settings').push({
  created: new Date().getTime()
})

lineReader.eachLine(pifPath, function(line, last) {

  if (line.substr(0, 3) != "***") {

    var item = null

    console.log('processing...')

    item = JSON.parse(line)

    if (item) {

      var entry = {}

      entry.id = uuid.v4()

      entry.name = item.title

      switch (item.typeName) {
        case "webforms.WebForm":

          console.log(item)

          if(item.location){
            console.log(item.location)
            var link = url.parse(item.location)

            entry.domain = link.hostname
          }

          var user = _.find(item.secureContents.fields, function(ii){ return ii.designation == "username" })

          if(user){
            //console.log(user.value)
            entry.username = user.value
          }

          var pwd = _.find(item.secureContents.fields, function(ii){ return ii.designation == "password" })

          if(pwd){
            //console.log(pwd.value)
            entry.password = pwd.value
          }

          db('password').push(entry)
          break

        case "wallet.computer.UnixServer":

          if(item.url){
            var link = url.parse(item.secureContents.url)

            if(link.protocol){
              entry.protocol = link.protocol
            }
          }

          entry.domain = item.secureContents.url
          entry.username = item.secureContents.username
          entry.password = item.secureContents.password
          db('server').push(entry)
          break

        case "wallet.financial.CreditCard":
          entry.type = item.secureContents.type
          entry.number = item.secureContents.ccnum
          entry.cvv = item.secureContents.cvv
          entry.expiry = item.secureContents.expiry_mm+'/'+item.secureContents.expiry_yy
          entry.cardholder = item.secureContents.cardholder
          db('ccard').push(entry)
          break

        default:
          break
      }
    }



  }

  // do whatever you want with line...
  if (last) {
    console.log('finished!')
      // or check if it's the last one
  }
});
