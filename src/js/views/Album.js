
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import FontAwesome from 'react-fontawesome'
let helpers = require('../helpers.js')

import TrackList from '../components/TrackList'
import Thumbnail from '../components/Thumbnail'
import Parallax from '../components/Parallax'
import ArtistSentence from '../components/ArtistSentence'
import ArtistGrid from '../components/ArtistGrid'
import Dater from '../components/Dater'

import * as spotifyActions from '../services/spotify/actions'
import * as mopidyActions from '../services/mopidy/actions'

class Album extends React.Component{

	constructor(props) {
		super(props);
	}

	componentDidMount(){
		this.loadAlbum();
	}

	componentWillReceiveProps( nextProps ){
		if( nextProps.params.uri != this.props.params.uri ){
			this.loadAlbum( nextProps )
		}else if( !this.props.mopidy.connected && nextProps.mopidy.connected ){
			if( helpers.uriSource( this.props.params.uri ) == 'local' ){
				this.loadAlbum( nextProps )
			}
		}
	}

	loadAlbum( props = this.props ){
		var source = helpers.uriSource( props.params.uri );
		if( source == 'spotify' ){
			this.props.spotifyActions.getAlbum( props.params.uri );
		}else if( source == 'local' && props.mopidy.connected ){
			this.props.mopidyActions.getAlbum( props.params.uri );
		}
	}

	render(){
		var source = helpers.uriSource( this.props.params.uri );
		if( source == 'spotify' ){
			var album = this.props.spotify.album
			var artists = this.props.spotify.artists
		}else if( source == 'local' ){
			var album = this.props.mopidy.album
			var artists = []
		}
		if( !album ) return null;

		return (
			<div className="view album-view">
				<div className="intro">
					<Thumbnail size="large" images={ ( album.images ? album.images : [] ) } />
					<ArtistGrid artists={ artists } />
					<ul className="details">
						<li>{ album.tracks.total } tracks, <Dater type="total-time" data={album.tracks.items} /></li>
						{ album.release_date ? <li>Released <Dater type="date" data={ album.release_date } /></li> : null }
						{ source == 'spotify' ? <li><FontAwesome name={source} /> Spotify playlist</li> : null }
						{ source == 'local' ? <li><FontAwesome name='folder' /> Local playlist</li> : null }	
					</ul>
				</div>
				<div className="main">
					<div className="title">
						<h1>{ album.name }</h1>
						<h3><ArtistSentence artists={ album.artists } /></h3>
					</div>
					<TrackList tracks={ album.tracks.items } />
				</div>
			</div>
		);
	}
}


/**
 * Export our component
 *
 * We also integrate our global store, using connect()
 **/

const mapStateToProps = (state, ownProps) => {
	return state;
}

const mapDispatchToProps = (dispatch) => {
	return {
		mopidyActions: bindActionCreators(mopidyActions, dispatch),
		spotifyActions: bindActionCreators(spotifyActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Album)