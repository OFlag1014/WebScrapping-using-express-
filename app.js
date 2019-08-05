var createError = require('http-errors');
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: './csv/file0_20.csv',
  header: [
    { id: 'SYSTEM-ID', title: 'SYSTEM-ID' },
    { id: 'Name Thai', title: 'Name Thai' },
    { id: 'Name English', title: 'Name English' },
    { id: 'License No.', title: 'License No.' },
    { id: 'License status', title: 'License status' },
    { id: 'Trader category', title: 'Trader category' },
    { id: 'Address', title: 'Address' },
    { id: 'Phone', title: 'Phone' },
    { id: 'Email', title: 'Email' }
  ]
});

// var fs = require('fs');
var fs = require('graceful-fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/scrap', async function (req, res) {
  for (var i = 35001; i <= 40000; i++) {
    // var i = 156;
    var license = "11-";
    if (i < 10) {
      license = license + "0000" + i;
    } else if (i >= 10 && i < 100) {
      license = license + "000" + i;
    } else if (i >= 100 && i < 1000) {
      license = license + "00" + i;
    } else if (i >= 1000 && i < 10000) {
      license = license + "0" + i;
    } else {
      license = license + i;
    }
    const traderData = await getTraderId(license)
      .catch((err) => {
        console.log("Error occured in ID request: ", err);
      });
    var $ = cheerio.load(traderData);
    var id = $('.listview > li') &&
      $('.listview > li')[0] &&
      $('.listview > li')[0]['attribs'] &&
      $('.listview > li')[0]['attribs']['id'] ?
      $('.listview > li')[0]['attribs']['id'] : "";
    if (id) {
      const profile = await getProfile(id).catch((err) => {
        console.log("Error occured in Profile Request: ", err);
      });
      if (profile) {
        var $ = cheerio.load(profile);

        var thaianName = $('.padding-top5') &&
          $('.padding-top5')[0] &&
          $('.padding-top5')[0].children &&
          $('.padding-top5')[0].children[0] &&
          $('.padding-top5')[0].children[0]['data'] ?
          $('.padding-top5')[0].children[0]['data'].substr(1) : "";
          // console.log("thaianName: ", thaianName);

        var englishName = $('.bg-color-green') &&
          $('.bg-color-green')[0] &&
          $('.bg-color-green')[0].children &&
          $('.bg-color-green')[0].children[3] &&
          $('.bg-color-green')[0].children[3].children &&
          $('.bg-color-green')[0].children[3].children[0] &&
          $('.bg-color-green')[0].children[3].children[0]['data'] ?
          $('.bg-color-green')[0].children[3].children[0]['data'].substr(1) : "";
          // console.log("englishName:", englishName);

        var licenseStatus = $('span') &&
          $('span')[2] &&
          $('span')[2].children &&
          $('span')[2].children[0] &&
          $('span')[2].children[0]['data'] ?
          $('span')[2].children[0]['data'] : "";
          // console.log("liceseSta:", licenseStatus);

        var traderCategory = $('.place-right > h4') &&
          $('.place-right > h4')[0] &&
          $('.place-right > h4')[0].children &&
          $('.place-right > h4')[0].children[0] &&
          $('.place-right > h4')[0].children[0]['data'] ?
          $('.place-right > h4')[0].children[0]['data'] : "";
          // console.log("traderCategory:", traderCategory);

        var email = $('address') &&
          $('address')[0] &&
          $('address')[0].children &&
          $('address')[0].children[12] &&
          $('address')[0].children[12]['data'] ?
          $('address')[0].children[12]['data'].substr(7) : "";
          // console.log("email:", email);

        var phone = $('address') &&
          $('address')[0] &&
          $('address')[0].children &&
          $('address')[0].children[10] &&
          $('address')[0].children[10]['data'] ?
          $('address')[0].children[10]['data'].substr(17) : "";
          // console.log("phone:",phone);

        var country = $('address') &&
          $('address')[0] &&
          $('address')[0].children &&
          $('address')[0].children[2] &&
          $('address')[0].children[2]['data'] ?
          $('address')[0].children[2]['data'].substr(12) : "";

        var middleCountry = $('address') &&
          $('address')[0] &&
          $('address')[0].children &&
          $('address')[0].children[4] &&
          $('address')[0].children[4]['data'] ?
          $('address')[0].children[4]['data'].substr(13) : "";

        var bigCountry = $('address') &&
          $('address')[0] &&
          $('address')[0].children &&
          $('address')[0].children[6] &&
          $('address')[0].children[6]['data'] ?
          $('address')[0].children[6]['data'].substr(9) : "";

        var postNumber = $('address') &&
          $('address')[0] &&
          $('address')[0].children &&
          $('address')[0].children[8] &&
          $('address')[0].children[8]['data'] ?
          $('address')[0].children[8]['data'].substr(14) : "";

        var address = $('address') &&
          $('address')[0] &&
          $('address')[0].children &&
          $('address')[0].children[0] &&
          $('address')[0].children[0]['data'] ?
          $('address')[0].children[0]['data'].substr(44).slice(0, -11) : "";

        // console.log("here is country: ", country);
        // console.log("here is middleCountry: ", middleCountry);
        // console.log("here is bigCountry: ", bigCountry);
        // console.log("here is postNumber: ", postNumber);
        // console.log("here is address: ", address);

        var totalAddress = address + "|" + country + "|"
          + middleCountry + "|" + bigCountry + "|"
          + postNumber;

        // console.log("here is total address: ", totalAddress);

        // var temp = {
        //   "SYSTEM-ID": id + "|",
        //   "Name Thai": thaianName + "|",
        //   "Name English": englishName + "|",
        //   "License No.": license + "|",
        //   "License status": licenseStatus + "|",
        //   "Trader category": traderCategory + "|",
        //   Address: totalAddress + "|",
        //   Phone: phone + "|",
        //   Email: email
        // };

        var temp = id + "|" + thaianName + "|" + englishName + "|" + license + "|" + licenseStatus + "|" + traderCategory + "|" + totalAddress + "|" + phone + "|" + email + "\r\n";
        // const writeJson = await writeFile(temp).catch((err) => {
        //   console.log("Error occured in write Requst: ", err);
        // });
        // console.log(writeJson, "key: ", i);
        await writeTXT(temp).catch((err) => {
          console.log("Error: ", err);
        })
        console.log("written success, key: ", i);
      }

    }
  }
  res.json({ result: "success" });
});

// var total_data_array = [];
app.use('/datasort', async function (req, res) {
  var total_array = await readTxtAsArray('./txt/test.txt').catch((err) => {
    console.log("error occured in Reading: ", err);
  })

  var unique = total_array.filter((element, index, self) => {
    return index === self.indexOf(element);
  });

  // console.log("unique id: ", unique[1].find);

  console.log("total array: ", total_array);
  console.log("unique array: ", unique);

  unique.map(async (item) => {
    await writeTXT(item, './txt/result.txt').catch((err)=>{
      console.log("error in write unique array: ", err);
    });
  });

  res.json({totalArrayLength: total_array.length, filterArrayLength: unique.length, status: 'success'});
});

const readTxtAsArray = (path) => {

  var total_data_array=[];
  var line_number = 0;

  function func(data) {
    line_number = line_number + 1;
    console.log('Line: ' + data);
    console.log("line number: ", line_number);
    total_data_array.push(data);
  }

  return new Promise((resolve, reject) => {

    var input = fs.createReadStream(path);
    var remaining = '';

    input.on('data', function(data){
      remaining += data;
      var index = remaining.indexOf('\n');
      while (index > -1) {
        var line = remaining.substring(0, index);
        remaining = remaining.substring(index + 1);
        func(line);
        index = remaining.indexOf('\n');
      }
    });

    input.on('end', () => {
      resolve(total_data_array);
    });

    input.on('error', (err) => {
      reject(err);
    })
  });
}


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const getTraderId = (license) => {
  const url = "http://103.80.100.92:8087/mobiletourguide/info/license/guide/read";
  var formData = {
    searchParam: license,
    searchType: 'G'
  };

  return new Promise((resolve, reject) => {
    request.post({ url: url, formData: formData }, (err, res, body) => {
      if (!err) {
        resolve(body)
      } else {
        reject(err)
      }
    })
  })
}

const getProfile = (id) => {
  const url = `http://103.80.100.92:8087/mobiletourguide/info/license/guide/profile?traderId=${id}`;

  return new Promise((resolve, reject) => {
    request.post({ url: url }, (err, res, body) => {
      if (!err) {
        resolve(body)
      } else {
        reject(err)
      }
    })
  })
}

const writeFile = (temp) => {
  return new Promise((resolve, reject) => {
    csvWriter.writeRecords([temp])
      .then(() => {
        resolve("...write Okay");
      })
      .catch(() => {
        reject("...write error")
      })
  });
}

const writeTXT = (temp, path) => {
  return new Promise((resolve, reject) => {
    fs.appendFile(path, temp, function(err) {
      if(err) {
          reject(err);
      }  
      else resolve("Written.")
    })
  });
}

const readTxt = ( file ) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, function(err, data){
        if(err) {
          reject(err);
        } else {
          resolve(data);
        }
    })
  })
}
module.exports = app;
