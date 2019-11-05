remark.macros.image = function (percentage) {
  var url = this;
  return '<img src="' + url + '" class = "center_img" style="width: ' + percentage + '" class = "center_img" />';
};

remark.macros.source = function (year) {
  var src = String(this);
  return '<p style="font-size:50%"><i>Source: ' + src + ' (' + year + ')</i></p>';
};

remark.macros.source_url = function (url) {
  var url = this;
  return '<p style="font-size:50%"><i>Source: <a href="' + url + '">' + url + '</a></i></p>';
};