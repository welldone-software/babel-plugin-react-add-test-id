import React, {PureComponent} from 'react';
import styled from 'styled-components';
import moment from 'moment';
import {TitleLabel, ShorterText} from 'shared/style/typography';
import {flexCenter, flexMiddle, FlexColumn, FlexCenter} from 'shared/components';
import Location from './Location';
import Path from './Path';
import {getTimezone} from 'shared/utils/date';


const Loading = styled(TitleLabel)`
	${flexCenter};
	color: ${({theme: {colors}}) => colors.porcelain};
	padding: 20px;
`;


const Wrapper = styled(ShorterText)`
	color: ${({theme}) => theme.battleground.infoPanel.valueTextColor};
	${({isOpen, theme}) => isOpen && theme.battleground.selectedMenuItem};
	
	margin: 0;
	box-sizing: border-box;
	cursor: pointer;
	${flexMiddle};
	${({isOpen}) => (isOpen ? 'border: solid 1px #7a01e4;' : 'border-bottom: 2px solid #2f3135')}
	background-color: ${({theme}) => theme.battleground.infoPanel.background};
	&:hover {
		background-color: ${({theme}) => theme.battleground.itemHoverBg};
	}
`;

const Box = styled('div')`
	min-width: 0;
	flex: 1;
`;

const Content = styled(FlexColumn)`
	width: 100%;
	box-sizing: border-box;
	padding: ${({narrow}) => narrow ? `12px 12px 12px 0px`: `12px 12px 12px 12px`};
`;

const Circle = styled(FlexCenter)`
	border: 1px solid ${({theme: {colors}}) => colors.porcelain};
	border-radius: 100%;
	color: ${({theme: {colors}}) => colors.porcelain};
	min-width: 24px;
	width: 24px;
	height: 24px;
	margin: -18px 4px 0;
`;


const AttackDateTime = styled(TitleLabel)`
	color: ${({theme}) => theme.battleground.infoPanel.attackDateTimeColor};
	padding: 9px 0 0 29px;
`;

class Attack extends PureComponent {
	handleAttackClick = () => {
		// check if clicking event or just selecting text
		if (window.getSelection && window.getSelection().toString()) {
			return;
		}

		const {
			handleAttackClick, event: {event: {_id: eventId}}
		} = this.props;
		handleAttackClick(eventId);
	}

	handleContextMenuClick = e => {
		const {
			event: {event},
			onRightClick,
		} = this.props;

		onRightClick(event, e);
	}

	handleNodeClick = () => {
		const {
			event: {mapEvent: {source}},
			handleNodeClick
		} = this.props;

		handleNodeClick(source.id);
	};

	handleClusterClick = clusterId => this.props.handleClusterClick(clusterId)

	handleMethodClick = () => {
		const {
			event: {event},
			handleMethodClick,
		} = this.props;

		handleMethodClick(event.method);
	}

	handleTargetNodeClick = () => {
		const {
			event: {mapEvent: {target}},
			handleNodeClick
		} = this.props;

		handleNodeClick(target.id);
	};

	render() {
		const {
			event: complexEvent,
			outbound,
			isOpen,
			clusterBy,
			attackNumber,
			handleNodeClick,
			handleClusterClick,
			handleParamClick,
		} = this.props;

		if (!complexEvent) {
			return <Loading>Loading...</Loading>;
		}

		const {
			event,
			mapEvent: {source, target, eventParameters},
		} = complexEvent;

		const sourceCluster = event.sourceClusters && Object.keys(event.sourceClusters).find(key => key === clusterBy.id);
		const targetCluster = event.targetClusters && Object.keys(event.targetClusters).find(key => key === clusterBy.id);

		return (
			<Wrapper
				id={event._id}
				isOpen={isOpen}
				onClick={this.handleAttackClick}
				onContextMenu={this.handleContextMenuClick}
			>
				{attackNumber && <Circle>{attackNumber}</Circle>}
				<Box>
					<Content narrow={!!attackNumber}>
						<Location
							node={source}
							cluster={sourceCluster && event.sourceClusters[sourceCluster]}
							onNodeClick={this.handleNodeClick}
							onClusterClick={this.handleClusterClick}
							open={isOpen}
						/>

						<Path
							methodName={event.displayName}
							onMethodClick={this.handleMethodClick}
							eventType={event.type}
							outbound={outbound}
							open={isOpen}
							eventParameters={eventParameters}
							onNodeClick={handleNodeClick}
							onClusterClick={handleClusterClick}
							onParamClick={handleParamClick}
						/>

						<Location
							node={target}
							cluster={targetCluster && event.targetClusters[targetCluster]}
							onNodeClick={this.handleTargetNodeClick}
							onClusterClick={this.handleClusterClick}
							open={isOpen}
						/>

						<AttackDateTime>{`${moment(event.timestamp).format('DD MMMM YYYY - HH:mm:ss')} (${getTimezone(event.timestamp)})`}</AttackDateTime>
					</Content>
				</Box>
			</Wrapper>
		);
	}
}

export default Attack;
