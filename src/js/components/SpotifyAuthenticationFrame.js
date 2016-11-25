
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { createStore, bindActionCreators } from 'redux'

import FontAwesome from 'react-fontawesome'
import Thumbnail from './Thumbnail'

import * as actions from '../services/spotify/actions'

class SpotifyAuthenticationFrame extends React.Component{

	constructor(props) {
		super(props);

		this.state = {
			frameUrl: '//jamesbarnsley.co.nz/auth.php?action=frame',
			authorizing: false
		}
	}

	componentDidMount(){

		let self = this;

		// listen for incoming messages from the authorization iframe
		// this is triggered when authentication is granted from the popup
		window.addEventListener('message', function(event){

			if(event.data == 'closed'){
				self.setState({
					frameUrl: '//jamesbarnsley.co.nz/auth.php?action=frame',
					authorizing: false
				})	
			}else{
				
				// only allow incoming data from our authorized authenticator proxy
				if( !/^https?:\/\/jamesbarnsley\.co\.nz/.test(event.origin) ) return false;
				
				var data = JSON.parse(event.data);
				self.props.actions.authorizationGranted( data );
				self.props.actions.getMe();

				// and turn off our authorizing switch
				self.setState({
					frameUrl: '//jamesbarnsley.co.nz/auth.php?action=frame',
					authorizing: false
				})				
			}

		}, false);
	}

	startAuthorization(){
		this.setState({
			frameUrl: '//jamesbarnsley.co.nz/auth.php?action=authorize&app='+location.protocol+'//'+window.location.host,
			authorizing: true
		})
	}

	renderMe(){
		if( !this.props.authorized || !this.props.me ) return null;

		return (
			<div className="me">
				<Thumbnail circle={true} size="small" images={this.props.me.images} />
				<div className="user-name">
					Logged in as {this.props.me.display_name ? this.props.me.display_name : null }
					&nbsp;(<Link to={'/user/'+this.props.me.uri}>{ this.props.me.id }</Link>)
				</div>
			</div>
		)
	}

	renderAuthorizeButton(){
		if( this.state.authorizing ){
			return (
				<button disabled>
					<FontAwesome name="circle-o-notch" spin />
					&nbsp;
					Authorizing...
				</button>
			);
		}else if( this.props.authorized ){
			return (
				<button onClick={() => this.props.actions.authorizationRevoked()}>Log out</button>
			);
		}else{
			return (
				<button onClick={() => this.startAuthorization()}>Log in</button>
			);
		}
	}

	renderRefreshButton(){
		if( !this.props.authorized ) return null;

		if( this.props.refreshing_token ){
			return (
				<button disabled>
					<FontAwesome name="circle-o-notch" spin />
					&nbsp;
					Refreshing...
				</button>
			);
		}else{
			return (
				<button onClick={() => this.props.actions.refreshingToken()}>Refresh token</button>
			);
		}
	}

	render(){
		return (
			<div>
				{ this.renderMe() }
				{ this.renderAuthorizeButton() }
				&nbsp;&nbsp;
				{ this.renderRefreshButton() }
				<iframe src={this.state.frameUrl} style={{ display: 'none' }}></iframe>
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		authorized: state.spotify.authorized,
		authorizing: state.spotify.authorizing,
		refreshing_token: state.spotify.refreshing_token,
		me: state.spotify.me
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SpotifyAuthenticationFrame)