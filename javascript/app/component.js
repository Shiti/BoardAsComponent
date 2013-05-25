/**
 * Created with IntelliJ IDEA.
 * User: shiti
 * Date: 4/2/13
 * Time: 7:42 PM
 * To change this template use File | Settings | File Templates.
 */
'use strict';
angular.module('Components', []).directive('whiteboard', function () {
    return {
        restrict: 'E',
        templateUrl: '/template/boardTemplate.html',
        replace: true,
        compile: function (tElement, tAttr, transclude) {

            //setting height and width
            var canvasElements = tElement.find("canvas");
            angular.forEach(canvasElements, function (canvas) {
                canvas.height = tAttr.height;
                canvas.width = tAttr.width;
            });

        },
        scope: {
            height: '@',
            width: '@'
        },
        controller: function ($scope, $window, $element) {

            $scope.tool = "cursor";

            $scope.canvasContainer = $element.find("div")[0];

            $scope.drawingCanvas = $element.find("canvas")[1];
            $scope.drawingContext = $scope.drawingCanvas.getContext("2d");

            $scope.drawingContext.lineWidth = 1;
            $scope.drawingContext.strokeStyle = "black";


            $scope.isDrawing = false;

            $scope.setCursorStyle = function () {
                var container = $scope.canvasContainer;
                if (($scope.tool === "rect") || ($scope.tool === "circle") || ($scope.tool === "line")) {
                    container.style.cursor = "crosshair";
                    //makes drawing confusing -- position of image is not right
               /* } else if ($scope.tool === "pencil") {
                    container.style.cursor = "url('../image/pencil.png'),auto";
                } else if ($scope.tool === "brush") {
                    container.style.cursor = "url('../image/brush.png'),auto";
                } else if ($scope.tool === "eraser") {
                    container.style.cursor = "url('/image/eraser.png'),auto";*/
                } else {
                    $scope.canvasContainer.style.cursor = "default";
                }
            };

            $scope.selectTool = function (elem) {

                var classes = elem.classList,
                    tools = $element.find("li");

                // change tool only if its not the current tool
                if (!classes.contains("selected")) {

                    // unselected tool will only have tools and toolName class
                    angular.forEach(classes, function (c) {
                        if (c !== "tools") {
                            $scope.tool = c;
                        }
                    });

                    // remove selected class if any other tool has it
                    angular.forEach(tools, function (t) {
                        if (t.classList.contains("selected")) {
                            t.classList.remove("selected");
                            return false;
                        }
                    });

                    elem.classList.add("selected");

                    if ($scope.tool === "brush" || $scope.tool === "eraser") {
                        $scope.drawingContext.lineWidth = 5;
                        if ($scope.tool === "eraser") {
                            $scope.drawingContext.strokeStyle = "white";
                        } else {
                            $scope.drawingContext.strokeStyle = "black";
                        }
                    } else {
                        $scope.drawingContext.strokeStyle = "black";
                        $scope.drawingContext.lineWidth = 1;
                    }
                    $scope.setCursorStyle();
                }
            };

            $scope.startDrawing = function (event) {
                var x = event.clientX,
                    y = event.clientY;

                if ($scope.tool !== "cursor" && $scope.tool !== "clearAll") {
                    $scope.startingPoint = {x: x, y: y};
                    $scope.isDrawing = true;
                    $scope.drawingContext.beginPath();
                    $scope.drawingContext.moveTo(x, y);
                }

            };

            $scope.endDrawing = function () {
                if ($scope.isDrawing) {
                    $scope.isDrawing = false;
                    $scope.updateOriginal();
                } else if ($scope.tool === "clearAll") {
                    $scope.clearDrawing();
                }
            };

            $scope.drawShape = function (endingPoint) {
                var context = $scope.drawingContext,
                    difference = {x: 0, y: 0},
                    startingPoint = $scope.startingPoint;
                switch ($scope.tool) {
                    case "line":
                        context.beginPath();
                        context.moveTo(startingPoint.x, startingPoint.y);
                        context.lineTo(endingPoint.x, endingPoint.y);
                        context.stroke();
                        context.closePath();
                        break;
                    case "rect":
                        difference.x = -endingPoint.x + startingPoint.x;
                        difference.y = -endingPoint.y + startingPoint.y;
                        context.strokeRect(startingPoint.x, startingPoint.y, -difference.x, -difference.y);
                        break;
                    case "circle":
                        var x = (startingPoint.x + endingPoint.x) / 2;
                        var y = (startingPoint.y + endingPoint.y) / 2;
                        difference.x = (startingPoint.x - endingPoint.x) * (startingPoint.x - endingPoint.x);
                        difference.y = (startingPoint.y - endingPoint.y) * (startingPoint.y - endingPoint.y);
                        var radius = Math.sqrt(difference.x + difference.y) / 2;
                        context.beginPath();
                        context.arc(x, y, radius, 0, 2 * Math.PI, false);
                        context.stroke();
                        break;
                }
            };

            $scope.draw = function (event) {
                var x = event.clientX,
                    y = event.clientY;
                if ($scope.isDrawing) {
                    if ($scope.tool === "pencil" || $scope.tool === "brush" || $scope.tool === "eraser") {
                        $scope.drawingContext.lineTo(x, y);
                        $scope.drawingContext.stroke();
                    } else if ($scope.tool === "line" || $scope.tool === "rect" || $scope.tool === "circle") {
                        $scope.drawingContext.clearRect(0, 0, $scope.width, $scope.height);
                        $scope.drawShape({x: x, y: y});
                    }

                }
            };

            $scope.updateOriginal = function () {
                var originalCanvas = $element.find("canvas")[0],
                    originalContext = originalCanvas.getContext("2d"),
                    temporaryCanvas = $scope.drawingCanvas;
                originalContext.beginPath();
                originalContext.drawImage(temporaryCanvas, 0, 0);
                originalContext.closePath();
                $scope.drawingContext.clearRect(0, 0, temporaryCanvas.width, temporaryCanvas.height);
            };

            $scope.clearDrawing = function () {
                var originalCanvas = $element.find("canvas")[0],
                    originalContext = originalCanvas.getContext("2d");
                originalContext.clearRect(0, 0, $scope.width, $scope.height);
            };
        }
    };
});