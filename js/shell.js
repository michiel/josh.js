(function ($, document, window) {
  Shell = function (config) {
    config = config || {};
    // instance fields
    var _prompt = config.prompt || 'jsh$';
    var _shell_id = config.shell_id || '#shell';
    var _input_id = config.input_id || '#shell-cli';
    var _input_html = config.input_html || '<div id="shell-cli"><span class="prompt"></span>&nbsp;<span class="input"><span class="left"/><span class="cursor"/><span class="right"/></span></div>';
    var _blinktime = config.blinktime || 500;
    var _readline = config.readline || new ReadLine();
    var _active = false;
    var _cursor_visible = false;
    var _onCmd;
    var _line = {
      text:'',
      cursor:0
    };

    // public methods
    var self = {
      activate:function () {
        init();
        self.refresh();
        _active = true;
        _readline.activate();
        blinkCursor();
      },
      deactivate:function () {
        _active = false;
        _readline.deactivate();
      },
      setPrompt:function (prompt) {
        _prompt = prompt;
        if (!_active) {
          return;
        }
        self.refresh();
      },
      setInput:function (text, cursor) {
        _line = {text:text, cursor:cursor};
        if (!_active) {
          return;
        }
        self.refresh();
      },
      onCmd:function(callback) {
        _onCmd = callback;
      },
      onCompletion:function(callback) {
        _readline.onCompletion(function(line) {
          callback(line,_input_id);
        });
      },
      render:function () {
        var left = _line.text.substr(0, _line.cursor);
        var cursor = _line.text.substr(_line.cursor, 1);
        var right = _line.text.substr(_line.cursor + 1);
        $(_input_id + ' .prompt').text(_prompt);
        $(_input_id + ' .input .left').text(left);
        if (!cursor) {
          $(_input_id + ' .input .cursor').html('&nbsp;').css('textDecoration', 'underline');
        } else {
          $(_input_id + ' .input .cursor').text(cursor).css('textDecoration', 'underline');
        }
        $(_input_id + ' .input .right').text(right);
        _cursor_visible = true;
        console.log('rendered "' + _line.text + '" w/ cursor at ' + _line.cursor);
      },
      refresh:function () {
        $(_input_id).replaceWith(_input_html);
        self.render();
        console.log('refreshed ' + _input_id);
      }
    };

    function blinkCursor() {
      if (!_active) {
        return;
      }
      window.setTimeout(function () {
        if (!_active) {
          return;
        }
        _cursor_visible = !_cursor_visible;
        if (_cursor_visible) {
          $(_input_id + ' .input .cursor').css('textDecoration', 'underline');
        } else {
          $(_input_id + ' .input .cursor').css('textDecoration', '');
        }
        blinkCursor();
      }, _blinktime);
    }

    function init() {
      if ($(_shell_id).length == 0) {
        _active = false;
        return;
      }
      if ($(_input_id).length == 0) {
        $(_shell_id).append(_input_html);
      }
    }

    // init
    _readline.onChange(function (line) {
      _line = line;
      self.render();
    });
    _readline.onEnter(function(cmd,line) {
      console.log("got command: "+ cmd);
      if(_onCmd) {
        _onCmd(cmd,_input_id);
      }
      $(_input_id).removeAttr('id');
      $(_shell_id).append(_input_html);
      _line = line;
      self.refresh();
    });
    return self;
  };
})(jQuery, document, window);
