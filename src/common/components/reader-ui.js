import React, { Fragment, useState, useRef, useImperativeHandle } from 'react';
import Toolbar from './toolbar';
import Sidebar from './sidebar/sidebar';
import SelectionPopup from './view-popup/selection-popup';
import FindPopup from './view-popup/find-popup';
import AnnotationPopup from './view-popup/annotation-popup';
import AnnotationsView from './sidebar/annotations-view';
import SidebarResizer from './sidebar/sidebar-resizer';
import SplitViewResizer from './split-view-resizer';
import ThumbnailsView from './sidebar/thumbnails-view';
import OutlineView from './sidebar/outline-view';
import OverlayPopup from './view-popup/overlay-popup';
import ContextMenu from './context-menu';
import LabelPopup from './modal-popup/label-popup';
import PasswordPopup from './modal-popup/password-popup';
import PrintPopup from './modal-popup/print-popup';
import AppearancePopup from "./modal-popup/appearance-popup";
import ThemePopup from './modal-popup/theme-popup';
import PropTypes from 'prop-types';


function View(props) {
	let { primary, state } = props;

	let name = primary ? 'primary' : 'secondary';

	function handleFindStateChange(params) {
		props.onChangeFindState(primary, params);
	}

	function handleFindNext() {
		props.onFindNext(primary);
	}

	function handleFindPrevious() {
		props.onFindPrevious(primary);
	}

	async function handleConvertSearchResults() {
		console.log('handleConvertSearchResults called', { pdfView: props.pdfView, tools: props.tools });
		// Find the PDFView instance for this view
		if (props.pdfView && typeof props.pdfView._handleConvertSearchResults === 'function') {
			// Use highlight color from tools or default to yellow
			const color = (props.tools && props.tools.highlight && props.tools.highlight.color) || '#ffff00';
			console.log('Calling _handleConvertSearchResults with color:', color);
			await props.pdfView._handleConvertSearchResults({ type: 'highlight', color });
		} else {
			console.log('No valid pdfView or _handleConvertSearchResults function');
			// fallback: do nothing or show error
			// Optionally, you could show a notification here
		}
	}

	return (
		<div className={name + '-view'}>
			<div
				data-tabstop={1}
				tabIndex={-1}
				data-proxy={`#${name}-view > iframe`}
				style={{ position: 'absolute' }}
			/>
			{state[name + 'ViewSelectionPopup'] && !state.readOnly
				&& <SelectionPopup
					params={state[name + 'ViewSelectionPopup']}
					textSelectionAnnotationMode={state.textSelectionAnnotationMode}
					enableAddToNote={state.enableAddToNote}
					onAddToNote={props.onAddToNote}
					onAddAnnotation={props.onAddAnnotation}
					onChangeTextSelectionAnnotationMode={props.onChangeTextSelectionAnnotationMode}
				/>
			}
			{state[name + 'ViewAnnotationPopup']
				&& (
					(!state.sidebarOpen || state.sidebarView !== 'annotations')
					&& state.annotations.find(x => x.id === state[name + 'ViewAnnotationPopup'].annotation.id)
				)
				&& <AnnotationPopup
					type={props.type}
					readOnly={state.readOnly}
					params={state[name + 'ViewAnnotationPopup']}
					annotation={state.annotations.find(x => x.id === state[name + 'ViewAnnotationPopup'].annotation.id)}
					onChange={(annotation) => props.onUpdateAnnotations([annotation])}
					onDragStart={() => {}}
					onOpenTagsPopup={props.onOpenTagsPopup}
					onOpenPageLabelPopup={props.onOpenPageLabelPopup}
					onOpenAnnotationContextMenu={props.onOpenAnnotationContextMenu}
					onSetDataTransferAnnotations={props.onSetDataTransferAnnotations}
				/>
			}
			{state[name + 'ViewOverlayPopup']
				&& <OverlayPopup
					params={state[name + 'ViewOverlayPopup']}
					onOpenLink={props.onOpenLink}
					onNavigate={props.onNavigate}
					onClose={props.onCloseOverlayPopup}
				/>
			}
			{state[name + 'ViewFindState'].popupOpen
				&& <FindPopup
					params={state[name + 'ViewFindState']}
					onChange={handleFindStateChange}
					onFindNext={handleFindNext}
					onFindPrevious={handleFindPrevious}
					onAddAnnotation={props.onAddAnnotation}
					tools={props.tools}
					onConvertSearchResults={handleConvertSearchResults}
				/>
			}
		</div>
	);
}

View.propTypes = {
	pdfView: PropTypes.object,
	primary: PropTypes.bool,
	state: PropTypes.object.isRequired,
	onChangeFindState: PropTypes.func.isRequired,
	onFindNext: PropTypes.func.isRequired,
	onFindPrevious: PropTypes.func.isRequired,
	onCloseOverlayPopup: PropTypes.func.isRequired,
	tools: PropTypes.object,
	onAddAnnotation: PropTypes.func,
	onUpdateAnnotations: PropTypes.func,
	onAddToNote: PropTypes.func,
	onChangeTextSelectionAnnotationMode: PropTypes.func,
	onOpenTagsPopup: PropTypes.func,
	onOpenPageLabelPopup: PropTypes.func,
	onOpenAnnotationContextMenu: PropTypes.func,
	onSetDataTransferAnnotations: PropTypes.func,
	onOpenLink: PropTypes.func,
	onNavigate: PropTypes.func,
	type: PropTypes.string
};

const ReaderUI = React.forwardRef((props, ref) => {
	let [state, setState] = useState(props.state);
	let [authorName, setAuthorName] = useState(() => {
		let name = window.localStorage.getItem('annotationAuthorName');
		if (!name) {
			name = window.prompt('Enter your name for annotations:', '');
			if (name) {
				window.localStorage.setItem('annotationAuthorName', name);
			}
		}
		return name || '';
	});
	let annotationsViewRef = useRef();

	useImperativeHandle(ref, () => ({
		setState,
		sidebarScrollAnnotationIntoView: (id) => annotationsViewRef.current?.scrollAnnotationIntoView(id),
		sidebarEditAnnotationText: (id) => annotationsViewRef.current?.editAnnotationText(id),
	}));

	let findState = state.primary ? state.primaryViewFindState : state.secondaryViewFindState;
	let viewStats = state.primary ? state.primaryViewStats : state.secondaryViewStats;

	let stackedView = state.bottomPlaceholderHeight !== null;
	let showContextPaneToggle = state.showContextPaneToggle && (stackedView || !state.contextPaneOpen);

	function handleChangeAuthorName() {
		const newName = window.prompt('Enter your name for annotations:', authorName);
		if (newName !== null) {
			setAuthorName(newName);
			window.localStorage.setItem('annotationAuthorName', newName);
			props.onChangeAuthorName && props.onChangeAuthorName(newName);
		}
	}

	return (
		<Fragment>
			<div>
				<Toolbar
					type={props.type}
					pageIndex={viewStats.pageIndex || 0}
					pageLabel={viewStats.pageLabel || ''}
					pagesCount={viewStats.pagesCount || 0}
					usePhysicalPageNumbers={viewStats.usePhysicalPageNumbers}
					percentage={viewStats.percentage || ''}
					sidebarOpen={state.sidebarOpen}
					enableZoomOut={viewStats.canZoomOut}
					enableZoomIn={viewStats.canZoomIn}
					enableZoomReset={viewStats.canZoomReset}
					enableNavigateBack={viewStats.canNavigateBack}
					enableNavigateToPreviousPage={viewStats.canNavigateToPreviousPage}
					enableNavigateToNextPage={viewStats.canNavigateToNextPage}
					appearancePopup={state.appearancePopup}
					findPopupOpen={findState.popupOpen}
					themes={state.themes}
					onChangeTheme={props.onChangeTheme}
					tool={state.tool}
					readOnly={state.readOnly}
					stackedView={stackedView}
					showContextPaneToggle={showContextPaneToggle}
					onToggleSidebar={props.onToggleSidebar}
					onZoomIn={props.onZoomIn}
					onZoomOut={props.onZoomOut}
					onZoomReset={props.onZoomReset}
					onNavigateBack={props.onNavigateBack}
					onNavigateToPreviousPage={props.onNavigateToPreviousPage}
					onNavigateToNextPage={props.onNavigateToNextPage}
					onChangePageNumber={props.onChangePageNumber}
					onChangeTool={props.onChangeTool}
					onOpenColorContextMenu={props.onOpenColorContextMenu}
					onToggleAppearancePopup={props.onToggleAppearancePopup}
					onToggleFind={props.onToggleFind}
					onToggleContextPane={props.onToggleContextPane}
				>
					<button onClick={handleChangeAuthorName} title="Change annotation author name">
						Change Annotation Name
					</button>
				</Toolbar>
				<div>
					{state.sidebarOpen === true
						&& <Sidebar
							type={props.type}
							view={state.sidebarView}
							filter={state.filter}
							outline={state.outline}
							outlineQuery={state.outlineQuery}
							onUpdateOutline={props.onUpdateOutline}
							onUpdateOutlineQuery={props.onUpdateOutlineQuery}
							onChangeView={props.onChangeSidebarView}
							onChangeFilter={props.onChangeFilter}
							thumbnailsView={
								<ThumbnailsView
									pageLabels={state.pageLabels}
									thumbnails={state.thumbnails}
									currentPageIndex={viewStats.pageIndex || 0}
									onOpenThumbnailContextMenu={props.onOpenThumbnailContextMenu}
									onRenderThumbnails={props.onRenderThumbnails}
									onNavigate={props.onNavigate}
								/>
							}
							annotationsView={
								<AnnotationsView
									ref={annotationsViewRef}
									type={props.type}
									readOnly={state.readOnly}
									filter={state.filter}
									annotations={state.annotations}
									selectedIDs={state.selectedAnnotationIDs}
									authorName={authorName}
									onSelectAnnotations={props.onSelectAnnotations}
									onUpdateAnnotations={props.onUpdateAnnotations}
									onSetDataTransferAnnotations={props.onSetDataTransferAnnotations}
									onOpenTagsPopup={props.onOpenTagsPopup}
									onOpenPageLabelPopup={props.onOpenPageLabelPopup}
									onOpenAnnotationContextMenu={props.onOpenAnnotationContextMenu}
									onOpenSelectorContextMenu={props.onOpenSelectorContextMenu}
									onChangeFilter={props.onChangeFilter}
								/>
							}
							outlineView={
								<OutlineView
									outline={state.outline}
									currentOutlinePath={viewStats.outlinePath}
									onNavigate={props.onNavigate}
									onOpenLink={props.onOpenLink}
									onUpdate={props.onUpdateOutline}
								/>
							}
						/>
					}

				</div>
				{state.sidebarOpen === true && <SidebarResizer onResize={props.onResizeSidebar}/>}
			</div>
			<div className="split-view">
				<View {...props} primary={true} state={state}/>
				<SplitViewResizer onResize={props.onResizeSplitView}/>
				{state.splitType && <View {...props} primary={false} state={state} />}
			</div>
			{state.contextMenu && <ContextMenu params={state.contextMenu} onClose={props.onCloseContextMenu}/>}
			{state.labelPopup && <LabelPopup params={state.labelPopup} onUpdateAnnotations={props.onUpdateAnnotations} onClose={props.onCloseLabelPopup}/>}
			{state.passwordPopup && <PasswordPopup params={state.passwordPopup} onEnterPassword={props.onEnterPassword}/>}
			{state.printPopup && <PrintPopup params={state.printPopup}/>}
			{state.errorMessage && <div className="error-bar" tabIndex={-1}>{state.errorMessage}</div>}
			{state.appearancePopup && (
				// We always read the primaryViewState, but we write both view states
				<AppearancePopup
					customThemes={state.customThemes}
					colorScheme={state.colorScheme}
					lightTheme={state.lightTheme}
					darkTheme={state.darkTheme}
					splitType={state.splitType}
					viewStats={viewStats}
					onChangeSplitType={props.onChangeSplitType}
					onChangeScrollMode={props.onChangeScrollMode}
					onChangeSpreadMode={props.onChangeSpreadMode}
					onChangeFlowMode={props.onChangeFlowMode}
					onChangeAppearance={props.onChangeAppearance}
					onChangeFocusModeEnabled={props.onChangeFocusModeEnabled}
					onAddTheme={props.onAddTheme}
					onChangeTheme={props.onChangeTheme}
					onOpenThemeContextMenu={props.onOpenThemeContextMenu}
					onClose={() => props.onToggleAppearancePopup(false)}
				/>
			)}
			{state.themePopup && (
				<ThemePopup
					params={state.themePopup}
					customThemes={state.customThemes}
					colorScheme={state.colorScheme}
					lightTheme={state.lightTheme}
					darkTheme={state.darkTheme}
					onSaveCustomThemes={props.onSaveCustomThemes}
					onClose={props.onCloseThemePopup}
				/>
			)}
			<div id="a11yAnnouncement" aria-live="polite"></div>
		</Fragment>
	);
});

ReaderUI.displayName = 'ReaderUI';

ReaderUI.propTypes = {
	type: PropTypes.string,
	state: PropTypes.object.isRequired,
	onChangeTheme: PropTypes.func,
	onToggleSidebar: PropTypes.func,
	onZoomIn: PropTypes.func,
	onZoomOut: PropTypes.func,
	onZoomReset: PropTypes.func,
	onNavigateBack: PropTypes.func,
	onNavigateToPreviousPage: PropTypes.func,
	onNavigateToNextPage: PropTypes.func,
	onChangePageNumber: PropTypes.func,
	onChangeTool: PropTypes.func,
	onOpenColorContextMenu: PropTypes.func,
	onToggleAppearancePopup: PropTypes.func,
	onToggleFind: PropTypes.func,
	onToggleContextPane: PropTypes.func,
	onUpdateOutline: PropTypes.func,
	onUpdateOutlineQuery: PropTypes.func,
	onChangeSidebarView: PropTypes.func,
	onChangeFilter: PropTypes.func,
	onOpenThumbnailContextMenu: PropTypes.func,
	onRenderThumbnails: PropTypes.func,
	onNavigate: PropTypes.func,
	onSelectAnnotations: PropTypes.func,
	onUpdateAnnotations: PropTypes.func,
	onSetDataTransferAnnotations: PropTypes.func,
	onOpenTagsPopup: PropTypes.func,
	onOpenPageLabelPopup: PropTypes.func,
	onOpenAnnotationContextMenu: PropTypes.func,
	onOpenSelectorContextMenu: PropTypes.func,
	onOpenLink: PropTypes.func,
	onResizeSidebar: PropTypes.func,
	onResizeSplitView: PropTypes.func,
	onCloseContextMenu: PropTypes.func,
	onCloseLabelPopup: PropTypes.func,
	onEnterPassword: PropTypes.func,
	onChangeSplitType: PropTypes.func,
	onChangeScrollMode: PropTypes.func,
	onChangeSpreadMode: PropTypes.func,
	onChangeFlowMode: PropTypes.func,
	onChangeAppearance: PropTypes.func,
	onChangeFocusModeEnabled: PropTypes.func,
	onAddTheme: PropTypes.func,
	onOpenThemeContextMenu: PropTypes.func,
	onSaveCustomThemes: PropTypes.func,
	onCloseThemePopup: PropTypes.func,
	onChangeAuthorName: PropTypes.func,
	// Add other props as needed
};

export default ReaderUI;
