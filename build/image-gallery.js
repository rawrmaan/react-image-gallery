'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactSwipeable = require('react-swipeable');

var _reactSwipeable2 = _interopRequireDefault(_reactSwipeable);

var ImageGallery = _react2['default'].createClass({

  displayName: 'ImageGallery',

  propTypes: {
    items: _react2['default'].PropTypes.array.isRequired,
    showThumbnails: _react2['default'].PropTypes.bool,
    showBullets: _react2['default'].PropTypes.bool,
    showNav: _react2['default'].PropTypes.bool,
    showIndex: _react2['default'].PropTypes.bool,
    indexSeparator: _react2['default'].PropTypes.string,
    autoPlay: _react2['default'].PropTypes.bool,
    lazyLoad: _react2['default'].PropTypes.bool,
    slideInterval: _react2['default'].PropTypes.number,
    onSlide: _react2['default'].PropTypes.func,
    onClick: _react2['default'].PropTypes.func,
    startIndex: _react2['default'].PropTypes.number,
    height: _react2['default'].PropTypes.string,
    imageScale: _react2['default'].PropTypes.string,
    backgroundColor: _react2['default'].PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      lazyLoad: true,
      showThumbnails: true,
      showBullets: false,
      showNav: true,
      showIndex: false,
      indexSeparator: ' / ',
      autoPlay: false,
      slideInterval: 4000,
      startIndex: 0,
      height: "700px",
      imageScale: 'contain',
      backgroundColor: '#FFFFFF'
    };
  },

  getInitialState: function getInitialState() {
    return {
      currentIndex: this.props.startIndex,
      thumbnailsTranslateX: 0,
      containerWidth: 0
    };
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    if (prevState.containerWidth !== this.state.containerWidth || prevProps.showThumbnails !== this.props.showThumbnails) {

      // adjust thumbnail container when window width is adjusted
      // when the container resizes, thumbnailsTranslateX
      // should always be negative (moving right),
      // if container fits all thumbnails its set to 0

      this._setThumbnailsTranslateX(-this._getScrollX(this.state.currentIndex > 0 ? 1 : 0) * this.state.currentIndex);
    }

    if (prevState.currentIndex !== this.state.currentIndex) {

      // call back function if provided
      if (this.props.onSlide) {
        this.props.onSlide(this.state.currentIndex);
      }

      // calculates thumbnail container position
      if (this.state.currentIndex === 0) {
        this._setThumbnailsTranslateX(0);
      } else {
        var indexDifference = Math.abs(prevState.currentIndex - this.state.currentIndex);
        var _scrollX = this._getScrollX(indexDifference);
        if (_scrollX > 0) {
          if (prevState.currentIndex < this.state.currentIndex) {
            this._setThumbnailsTranslateX(this.state.thumbnailsTranslateX - _scrollX);
          } else if (prevState.currentIndex > this.state.currentIndex) {
            this._setThumbnailsTranslateX(this.state.thumbnailsTranslateX + _scrollX);
          }
        }
      }
    }
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (nextProps.items.length) {
      var startIndex = nextProps.startIndex || 0;
      this.setState({ currentIndex: startIndex });
    }
  },

  componentDidMount: function componentDidMount() {
    this._handleResize();
    if (this.props.autoPlay) {
      this.play();
    }
    if (window.addEventListener) {
      window.addEventListener('resize', this._handleResize);
    } else if (window.attachEvent) {
      window.attachEvent('onresize', this._handleResize);
    }
  },

  componentWillUnmount: function componentWillUnmount() {
    if (window.removeEventListener) {
      window.removeEventListener('resize', this._handleResize);
    } else if (window.detachEvent) {
      window.detachEvent('onresize', this._handleResize);
    }

    if (this._intervalId) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
    }
  },

  slideToNext: function slideToNext() {
    this.slideToIndex(this.state.currentIndex + 1);
  },

  slideToPrevious: function slideToPrevious() {
    this.slideToIndex(this.state.currentIndex - 1);
  },

  slideToIndex: function slideToIndex(index, event) {
    var slideCount = this.props.items.length - 1;

    if (index < 0) {
      this.setState({ currentIndex: slideCount });
    } else if (index > slideCount) {
      this.setState({ currentIndex: 0 });
    } else {
      this.setState({ currentIndex: index });
    }
    if (event) {
      if (this._intervalId) {
        // user event, reset interval
        this.pause();
        this.play();
      }
      event.preventDefault();
    }
  },

  play: function play() {
    var _this = this;

    if (this._intervalId) {
      return;
    }
    this._intervalId = window.setInterval((function () {
      if (!_this.state.hovering) {
        _this.slideToIndex(_this.state.currentIndex + 1);
      }
    }).bind(this), this.props.slideInterval);
  },

  pause: function pause() {
    if (this._intervalId) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
    }
  },

  _setThumbnailsTranslateX: function _setThumbnailsTranslateX(x) {
    this.setState({ thumbnailsTranslateX: x });
  },

  _handleResize: function _handleResize() {
    this.setState({ containerWidth: this._imageGallery.offsetWidth });
  },

  _getScrollX: function _getScrollX(indexDifference) {
    if (this._thumbnails) {
      if (this._thumbnails.scrollWidth <= this.state.containerWidth) {
        return 0;
      }

      var totalThumbnails = this._thumbnails.children.length;

      // total scroll-x required to see the last thumbnail
      var totalScrollX = this._thumbnails.scrollWidth - this.state.containerWidth;

      // scroll-x required per index change
      var perIndexScrollX = totalScrollX / (totalThumbnails - 1);

      return indexDifference * perIndexScrollX;
    }
  },

  _handleMouseOver: function _handleMouseOver() {
    this.setState({ hovering: true });
  },

  _handleMouseLeave: function _handleMouseLeave() {
    this.setState({ hovering: false });
  },

  _getAlignmentClassName: function _getAlignmentClassName(index) {
    var currentIndex = this.state.currentIndex;
    var alignment = '';
    switch (index) {
      case currentIndex - 1:
        alignment = ' left';
        break;
      case currentIndex:
        alignment = ' center';
        break;
      case currentIndex + 1:
        alignment = ' right';
        break;
    }

    if (this.props.items.length >= 3) {
      if (index === 0 && currentIndex === this.props.items.length - 1) {
        // set first slide as right slide if were sliding right from last slide
        alignment = ' right';
      } else if (index === this.props.items.length - 1 && currentIndex === 0) {
        // set last slide as left slide if were sliding left from first slide
        alignment = ' left';
      }
    }

    return alignment;
  },

  render: function render() {
    var _this2 = this;

    var currentIndex = this.state.currentIndex;
    var thumbnailStyle = {
      MozTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      WebkitTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      OTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      msTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      transform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)'
    };

    var slides = [];
    var thumbnails = [];
    var bullets = [];

    this.props.items.map(function (item, index) {
      var alignment = _this2._getAlignmentClassName(index);
      var originalClass = item.originalClass ? ' ' + item.originalClass : '';
      var thumbnailClass = item.thumbnailClass ? ' ' + item.thumbnailClass : '';

      var slideStyle = { height: _this2.props.height };

      var imageDivProps = {
        className: "image",
        style: {
          backgroundColor: _this2.props.backgroundColor,
          backgroundImage: 'url(' + item.original + ')',
          backgroundSize: _this2.props.imageScale,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          height: _this2.props.height
        }
      };

      var slide = _react2['default'].createElement(
        'div',
        {
          key: index,
          style: slideStyle,
          className: 'image-gallery-slide' + alignment + originalClass,
          onClick: _this2.props.onClick,
          onTouchStart: _this2.props.onClick },
        _react2['default'].createElement('div', imageDivProps),
        item.description
      );

      if (_this2.props.lazyLoad) {
        if (alignment) {
          slides.push(slide);
        }
      } else {
        slides.push(slide);
      }

      if (_this2.props.showThumbnails) {
        thumbnails.push(_react2['default'].createElement(
          'a',
          {
            key: index,
            className: 'image-gallery-thumbnail' + (currentIndex === index ? ' active' : '') + thumbnailClass,

            onTouchStart: _this2.slideToIndex.bind(_this2, index),
            onClick: _this2.slideToIndex.bind(_this2, index) },
          _react2['default'].createElement('img', { src: item.thumbnail })
        ));
      }

      if (_this2.props.showBullets) {
        bullets.push(_react2['default'].createElement('li', {
          key: index,
          className: 'image-gallery-bullet ' + (currentIndex === index ? 'active' : ''),

          onTouchStart: _this2.slideToIndex.bind(_this2, index),
          onClick: _this2.slideToIndex.bind(_this2, index) }));
      }
    });

    var swipePrev = this.slideToIndex.bind(this, currentIndex - 1);
    var swipeNext = this.slideToIndex.bind(this, currentIndex + 1);
    var itemsTotal = this.props.items.length;

    return _react2['default'].createElement(
      'section',
      { ref: function (i) {
          return _this2._imageGallery = i;
        }, className: 'image-gallery' },
      _react2['default'].createElement(
        'div',
        {
          onMouseOver: this._handleMouseOver,
          onMouseLeave: this._handleMouseLeave,
          className: 'image-gallery-content' },
        itemsTotal >= 2 ? [this.props.showNav && [_react2['default'].createElement('a', {
          key: 'leftNav',
          className: 'image-gallery-left-nav',
          onTouchStart: swipePrev,
          onClick: swipePrev }), _react2['default'].createElement('a', {
          key: 'rightNav',
          className: 'image-gallery-right-nav',
          onTouchStart: swipeNext,
          onClick: swipeNext })], _react2['default'].createElement(
          _reactSwipeable2['default'],
          {
            key: 'swipeable',
            onSwipedLeft: swipeNext,
            onSwipedRight: swipePrev },
          _react2['default'].createElement(
            'div',
            { className: 'image-gallery-slides' },
            slides
          )
        )] : _react2['default'].createElement(
          'div',
          { className: 'image-gallery-slides' },
          slides
        ),
        this.props.showBullets && _react2['default'].createElement(
          'div',
          { className: 'image-gallery-bullets' },
          _react2['default'].createElement(
            'ul',
            { className: 'image-gallery-bullets-container' },
            bullets
          )
        ),
        this.props.showIndex && _react2['default'].createElement(
          'div',
          { className: 'image-gallery-index' },
          _react2['default'].createElement(
            'span',
            { className: 'image-gallery-index-current' },
            this.state.currentIndex + 1
          ),
          _react2['default'].createElement(
            'span',
            { className: 'image-gallery-index-separator' },
            this.props.indexSeparator
          ),
          _react2['default'].createElement(
            'span',
            { className: 'image-gallery-index-total' },
            itemsTotal
          )
        )
      ),
      this.props.showThumbnails && _react2['default'].createElement(
        'div',
        { className: 'image-gallery-thumbnails' },
        _react2['default'].createElement(
          'div',
          {
            ref: function (t) {
              return _this2._thumbnails = t;
            },
            className: 'image-gallery-thumbnails-container',
            style: thumbnailStyle },
          thumbnails
        )
      )
    );
  }

});

exports['default'] = ImageGallery;
module.exports = exports['default'];