import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './index.html';

Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
  this.render('navbar', {
    to:"navbar"
  });
  this.render('website_form', {
  	to:"form"
  });
  this.render('website_list', {
    to:"main"
  });

});

Router.route('/:_id', function () {
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('website_item', {
        to: 'main',
        data: function() {
            return Websites.findOne({_id: this.params._id});
        }
    });
	this.render('comment_list', {
    	to: 'comment',
    	data:function() {
    		return Websites.findOne({_id: this.params._id});
    	}
	});
});


Comments.ui.config({
  generateAvatar: function (user, isAnonymous) {
    return user.profile.username;
  },
  defaultAvatar: 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png' // fallback
});

Template.body.rendered = function() {  
  var disqus_shortname = 'disqus_shortname'; // required: replace example with your forum shortname

  var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
  dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
}

Accounts.ui.config({
passwordSignupFields: "USERNAME_AND_EMAIL"
});

Template.registerHelper('formattedDate', function() {
     return moment(this.createdOn).format("MM/DD/YYYY");  // or whatever format you prefer
});


Template.website_list.helpers({
		websites:function(){
			return Websites.find({},{sort:{upvote:-1}});
		}
	});

Template.registerHelper('getUser', function(userId) {
     var user = Meteor.users.findOne({_id: userId});
    if (user) {
        return user.username;
    }
    else {
        return "anonymous";
    }
});

	 Template.comment_list.helpers({
		comments:function() {
			return Comments.get('_id');
		}
	}); 
Template.navbar.events({
	"keypress .navbar-form":function(event){
		if(event.charCode==13) {

		var query = event.target.value;
		Session.set('searchQuery',query);
		Meteor.subscribe('searchPosts', Session.get('searchQuery'));
		if (Session.get('searchQuery')) {
  			return Websites.find({}, { sort: [['score', 'desc']] });
		}
				return Websites.find();

		}
	}
});
Template.website_item.events({
		"click .js-upvote":function(event){
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			console.log("Up voting website with id "+website_id);
			// put the code in here to add a vote to a website!
			Websites.update({_id:website_id}, 
                {$set: {up:this.up+1}});

			return false;// prevent the button from reloading the page
		}, 
		"click .js-downvote":function(event){

			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			console.log("Down voting website with id "+website_id);
			// put the code in here to remove a vote from a website!
			Websites.update({_id:website_id}, 
                {$set: {down:this.down+1}});

			return false;// prevent the button from reloading the page
		}
	});

	Template.website_form.events({
		"click .js-toggle-website-form":function(event){
			$("#website_form").toggle('slow');
		}, 
		"submit .js-save-website-form":function(event){

			// here is an example of how to get the url out of the form:
			var result = Meteor.http.get(url);
			var url = event.target.url.value;
			console.log("The url they entered is: "+url);
			var title = event.target.title.value;
			var description = event.target.description.value;

			
			//  put your website saving code in here!	
			if (Meteor.user()){
      			Websites.insert({
        			title:title, 
        			url:url, 
        			description:description,
        			createdOn:new Date(),
        			up:0,
        			down:0
      		})
      	}
      

			return false;// stop the form submit from reloading the page

		}
	});


