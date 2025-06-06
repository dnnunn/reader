import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { ANNOTATION_COLORS } from '../../defines';
import ViewPopup from './common/view-popup';
import CustomSections from '../common/custom-sections';

import { IconColor16 } from '../common/icons';

import IconHighlight from '../../../../res/icons/16/annotate-highlight.svg';
import IconUnderline from '../../../../res/icons/16/annotate-underline.svg';
import IconSearch from '../../../../res/icons/16/search.svg';

function SelectionPopup(props) {
	const intl = useIntl();
	function handleColorPick(color) {
		const { textSelectionAnnotationMode, onAddAnnotation, params } = props;
		if (!textSelectionAnnotationMode || !onAddAnnotation || !params?.annotation) {
			return;
		}
		onAddAnnotation({ ...params.annotation, type: textSelectionAnnotationMode, color });
	}

	function handleAddToNote() {
		props.onAddToNote([props.params.annotation]);
	}

	function handleConvertSearchResults() {
		if (props.onConvertSearchResults) {
			props.onConvertSearchResults({
				type: props.textSelectionAnnotationMode,
				color: ANNOTATION_COLORS[0][1] // Default to yellow
			});
		}
	}

	return (
		<ViewPopup
			className="selection-popup"
			rect={props.params.rect}
			uniqueRef={{}}
			padding={20}
		>
			<div className="colors" data-tabstop={1}>
				{ANNOTATION_COLORS.map((color, index) => (<button
					key={index}
					tabIndex={-1}
					className="toolbar-button color-button"
					title={intl.formatMessage({ id: color[0] })}
					onClick={() => handleColorPick(color[1])}
				><IconColor16 color={color[1]}/></button>))}
			</div>
			<div className="tool-toggle" data-tabstop={1}>
				<button
					tabIndex={-1}
					className={cx('highlight', { active: props.textSelectionAnnotationMode === 'highlight' })}
					title={intl.formatMessage({ id: 'pdfReader.highlightText' })}
					onClick={() => props.onChangeTextSelectionAnnotationMode('highlight')}
				><IconHighlight/></button>
				<button
					tabIndex={-1}
					className={cx('underline', { active: props.textSelectionAnnotationMode === 'underline' })}
					title={intl.formatMessage({ id: 'pdfReader.underlineText' })}
					onClick={() => props.onChangeTextSelectionAnnotationMode('underline')}
				><IconUnderline/></button>
				{props.hasSearchResults && (
					<button
						tabIndex={-1}
						className="convert-search"
						title={intl.formatMessage({ id: 'pdfReader.convertSearchResults' })}
						onClick={handleConvertSearchResults}
					><IconSearch/></button>
				)}
			</div>
			{props.enableAddToNote
				&& <button className="toolbar-button wide-button" data-tabstop={1} onClick={handleAddToNote}>
					<FormattedMessage id="pdfReader.addToNote"/>
				</button>}
			<CustomSections type="TextSelectionPopup" annotation={props.params.annotation}/>
		</ViewPopup>
	);
}

SelectionPopup.propTypes = {
	params: PropTypes.shape({
		rect: PropTypes.object.isRequired,
		annotation: PropTypes.object.isRequired
	}).isRequired,
	textSelectionAnnotationMode: PropTypes.oneOf(['highlight', 'underline']),
	onAddAnnotation: PropTypes.func,
	onAddToNote: PropTypes.func.isRequired,
	onChangeTextSelectionAnnotationMode: PropTypes.func.isRequired,
	hasSearchResults: PropTypes.bool,
	onConvertSearchResults: PropTypes.func,
	enableAddToNote: PropTypes.bool
};

export default SelectionPopup;
