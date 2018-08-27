
import React, { Component } from 'react';
import Joi from 'joi';
//import logo from './logo.svg';
import L from 'leaflet';
import {Map,TileLayer,Marker,Popup} from 'react-leaflet';
import {Card,Button,CardTitle,CardText,Form,FormGroup,Label,Input} from 'reactstrap';
import './App.css';

//add the user informarion point (ancher)
var myIcon = L.icon({
   options: {
        iconUrl:'style/marker-pink.png',
        shadowUrl: './images/shadow.png',
        iconSize:[24, 45],
        iconAnchor: [24, 94],
        popupAnchor: [0, -10]
      }
    });
    const schema = Joi.object().keys({
        name: Joi.string().required(),
        message: Joi.string().min(1).max(500).required(),
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
        date: Joi.date()
    });
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/aoi/v1/messages' : 'prodeuction-url-here'
class App extends Component {
  state = {
    location:{
      lat: 45.4655 ,
      lng: 9.1865 ,
    },
    haveUsersLocation: false,
    zoom: 10,
    userMessage:{
    name: '',
    message: ''
  },
  sendingMessage: false,
  sentMessage:false,
  messages : []
  }
  componentDidMount(){
    fetch(API_URL)
       .then(res => res.json())
       .then(messages => {
         this.setState({
           messages
         });
       });
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude

        },
        haveUsersLocation: true,
        zoom: 15
      });
    },()=>{
      console.log('oooooooh they did not give us your the location');
      fetch('https://ipapi.co/json')
         .then(res => res.json())
         .then(location => {
           console.log(location);
           fetch('https://iapi.co/json')
           .then(res => res.json)
           .then(location =>{
             console.log(location);
             this.setState({
               location:{
                 lat:location.latitude,
                 log:location.longitude
               },
               haveUsersLocation:true,
               zoom:13
             });
           });
         });
    });
  }

formIsValid =() => {
  const userMessage ={
   name: this.state.userMessage.name,
   message: this.state.userMessage.message,
   latitude: this.state.userMessage.latitude,
   longitude: this.state.userMessage.longitude
 };
 const result = Joi.validate(userMessage,schema);
 return !result.error && this.state.haveUsersLocation? true : false ;
}

 formSubmitted = (event) =>{
   event.preventDefault();
   console.log(this.user.userMessage);
  if(this.formIsValid()){
    this.setState({
      sendingMessage:true
    });

    fetch(API_URL,{
      method:'POST',
      headers:{
        'content-type': 'application/json'
      },
       body: JSON.stringify({
         name: this.state.userMessage.name,
         message: this.state.userMessage.message,
         latitude: this.state.location.lat,
         longitude: this.state.location.lng
       })
    }) .then(res => res.json())
    .then(message =>{
      console.log(message);
      setTimeout(()=>{
        this.setState({
          sendingMessage:false,
          sentMessage:true
        });
      },4000);
    });
  }
 }
 valueChanged = (event) =>{
   const {name,value}=event.target;
   this.setState((prevState)=>({
     userMessage: {
       ...prevState.userMessage,
       [name]: value
     }
   }))
 }

  render() {
    const position = [this.state.location.lat,this.state.location.lng]
    return (
      <div className="map">
        <Map className="map" center={position} zoom={this.state.zoom}>
           <TileLayer
              attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors and Chat location by Iconika from the Noun Project"

              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

           />
           {
             this.state.haveUsersLocation ?
             <Marker position={position} icon={myIcon}>
               <Popup>
                 A pretty CSS3 popup.<br/> Easily customizable.
              </Popup>
            </Marker> : ''
          }
          {
            this.state.messages.map(message=>{
              <Marker position={[message.latitude,message.longitude]} icon={myIcon}>
              <Popup>
              <em>{message.name}:</em>{message.message}
              </Popup>
              </Marker>
            })
         }

      </Map>
      <Card body className="message-form">
         <CardTitle>Welcome to our App</CardTitle>
         <CardText>leave the message with your location </CardText>
         {
           !this.state.sendingMessage && !this.state.sentMessage  && !this.state.haveUsersLocation ? //the last part of the condition mut be true amd not false
           <Form onSubmit={this.formSubmitted}>
             <FormGroup>
               <Label for="name">Name </Label>
               <Input onChange={this.valueChanged} type="textarea" name="name" id='name' placeholder="Enter your name"></Input>
              </FormGroup>
              <Label for="message">message</Label>
              <Input onChange={this.valueChanged} type="testarea" name="name" id="message" placeholder="Enter your loacation"></Input>
              <Button type='submit' color='info' disabled={!this.formIsValid()}>Send</Button>
            </Form> :
            this.state.sendingMessage || this.state.haveUsersLocation ?
              <img alt='Loading...' src="https://i.giphy.com/media/BCIRKxED2Y2JO/giphy-downsized.gif"/> :
              <CardText>'Thanks for submitting a message'</CardText>

         }

       </Card>
      </div>
    );
  }
}

export default App;
