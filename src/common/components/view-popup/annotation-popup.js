import React from 'react';
import ViewPopup from './common/view-popup';
import { PopupPreview } from '../common/preview';
import PropTypes from 'prop-types';

function AnnotationPopup(props) {
	let { annotation } = props;
	return (
		<ViewPopup
			className="annotation-popup"
			rect={props.params.rect}
			uniqueRef={props.params.annotation.id}
			padding={20}
		>
			<PopupPreview
				type={props.type}
				readOnly={(props.readOnly || annotation.readOnly)}
				annotation={annotation}
				isExpandable={false}
				enableText={false}
				enableImage={false}
				enableComment={!(props.readOnly || annotation.readOnly) || annotation.comment}
				enableTags={!(props.readOnly || annotation.readOnly) || annotation.tags.length > 0}
				onUpdate={(comment) => {
					props.onChange({ id: annotation.id, comment });
				}}
				onColorChange={(color) => {
					props.onChange({ id: annotation.id, color });
				}}
				onOpenTagsPopup={props.onOpenTagsPopup}
				onChange={props.onChange}
				onOpenPageLabelPopup={props.onOpenPageLabelPopup}
				onOpenContextMenu={props.onOpenAnnotationContextMenu}
				onDragStart={(event) => {
					props.onSetDataTransferAnnotations(event.dataTransfer, [annotation]);
				}}
			/>
		</ViewPopup>
	);
}

AnnotationPopup.propTypes = {
	params: PropTypes.shape({
		rect: PropTypes.object.isRequired,
		annotation: PropTypes.shape({
			id: PropTypes.string.isRequired
		}).isRequired
	}).isRequired,
	type: PropTypes.string.isRequired,
	readOnly: PropTypes.bool,
	annotation: PropTypes.shape({
		id: PropTypes.string.isRequired,
		readOnly: PropTypes.bool,
		comment: PropTypes.string,
		tags: PropTypes.array
	}).isRequired,
	onChange: PropTypes.func.isRequired,
	onOpenTagsPopup: PropTypes.func.isRequired,
	onOpenPageLabelPopup: PropTypes.func.isRequired,
	onOpenAnnotationContextMenu: PropTypes.func.isRequired,
	onSetDataTransferAnnotations: PropTypes.func.isRequired
};

export default AnnotationPopup;
