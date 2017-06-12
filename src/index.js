import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Banner from './component/banner/banner';
import Toolbar from './component/toolbar/toolbar';
import Display from './component/display/display';

import HelpOverlay from './component/helpOverlay/helpOverlay';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

import sample from './lib/sample.js';
import { tracePageView } from './lib/telemetry.js';

class Index extends Component {
  constructor(props) {
    super(props);
    tracePageView();
    this.state = {
      console: {
        consoleMsg: '',
        consoleErr: '',
      },
      LEDTurnOn: false,
      isRunning: false,
      showHelp: false,
      showHintPart: 0
    }
    if (typeof(Storage) !== "undefined") {
        var disableHelp = localStorage.getItem("disable-help");
        if(disableHelp == null) {
            this.state.showHelp = true;
            localStorage.setItem("disable-help","true");
        }
    }
    this.runApp = this.runApp.bind(this);
    this.ledSwitch = this.ledSwitch.bind(this);
    this.onError = this.onError.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onFinish = this.onFinish.bind(this);
  }

  runApp() {
    if (this.state.isRunning) { return; }

    var option = {
      onMessage: this.onMessage,
      onError: this.onError,
      ledSwitch: this.ledSwitch,
      turnOff: this.turnOff,
      onFinish: this.onFinish
    }

    this.setState(function () {
      return {
        isRunning: true,
        console: {}
      }
    });
    sample(option);
  }

  onFinish() {
    this.setState(function () {
      return {
        isRunning: false
      }
    });
  }

  ledSwitch(isTurnOn) {
    this.setState(function () {
      return {
        LEDTurnOn: isTurnOn,
        console: {}
      };
    });
  }

  onMessage(message) {
    this.setState(function () {
      return {
        console: {
          consoleMsg: message
        }
      };
    });
  }
  onError(error) {
      if(error.indexOf("The connection string is missing the property") !== -1) {
          this.toggleHelpState();
      }
    this.setState(function () {
      return {
        console: {
          consoleErr: error.message || JSON.stringify(error)
        }
      };
    });
  }

  toggleHelpState = () => {
    this.setState((prev)=>{
        return {
            showHintPart: 0,
            showHelp: !prev.showHelp
        }
    })
  }

  changeHintPart = (part) => {
      this.setState(()=>{
          return {
              showHintPart: part
          }
      })
  }

  render() {
    const { console, LEDTurnOn, isRunning, showHelp, showHintPart } = this.state;
    
    return (
      <div className={`main ${this.state.showHelp ? "main-preview" : ""}`}>
        <Banner 
        toggleHelpState = {this.toggleHelpState} />
        {
          1 === 0 ? (<Toolbar onRunApp={this.runApp} />) : ('')
        }
        <Display
          consoleMsg={console.consoleMsg}
          consoleErr={console.consoleErr}
          onStart={this.runApp}
          isRunning={isRunning}
          turnOn={LEDTurnOn}
          needShowHelp = {showHelp}
          changeHintPart = {this.changeHintPart} />
        <HelpOverlay
          needShowHelp = {showHelp}
          toggleHelpState = {this.toggleHelpState}
          showHintPart =  {showHintPart}/>
      </div>
    );
  }
}

ReactDOM.render(
  <Index />,
  document.getElementById('root')
);