angular.module('lolvis.controllers')

.controller('MainController', ['$scope', 'D3Service', function($scope, d3) {
    $scope.level = 1;

    var StackedBarDrawer = function(data) {
        function layerize(data, n, status) {
            var layers = [];
            for(var j = 0; j < n; ++j) {
                var layer = [];
                for(var i = 0; i < data.length; ++i) {
                    var base = data[i].data.stats[status];
                    var scale = data[i].data.stats[status+'perlevel'];
                    if(j === 0) {
                        layer.push({x: i, y: base});
                    } else {
                        layer.push({x: i, y: scale});
                    }
                }
                layers.push(layer);
            }
            return layers;
        }

        var n = 18, // number of layers
            m = data.length, // number of samples per layer
            stack = d3.layout.stack();

        var margin = {top: 20, left: size},
            width = window.innerWidth - margin.left,
            height = data.length * size;

        var color = d3.scale.linear()
                .domain([0, n - 1])
                .range(['#66e', '#ee6']);

        var svg = d3.select('ion-content#content div.scroll').append('svg')
            .attr('width', width + margin.left)
            .attr('height', height + margin.top)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        svg.append('g').attr('class', 'x axis');
        svg.append('g').attr('class', 'y axis');

        var initLayers = stack(layerize(data, n, status));

        var layer = svg.selectAll('.layer')
                .data(initLayers)
                .enter().append('g')
                .attr('class', 'layer');

        var rect = layer.selectAll('rect')
                .data(function(d) {return d;})
                .enter().append('rect');

        var draw = function(status, level) {
            data.sort(function(a, b) {
                var a_total = a.data.stats[status] + a.data.stats[status+'perlevel'] * (level - 1);
                var b_total = b.data.stats[status] + b.data.stats[status+'perlevel'] * (level - 1);
                if(a_total < b_total) {
                    return 1;
                }
                if(a_total > b_total) {
                    return -1;
                }
                return 0;
            });

            var layers = stack(layerize(data, n, status)),
                yStackMax = d3.max(layers, function(layer) {return d3.max(layer, function(d) {return d.y0 + d.y;});});

            var x = d3.scale.ordinal()
                    .domain(d3.range(m))
                    .rangeRoundBands([0, height], .08, 0);

            var y = d3.scale.linear()
                    .domain([0, yStackMax])
                    .range([0, width]);

            var xAxis = d3.svg.axis()
                    .scale(x)
                    .tickSize(0)
                    .tickPadding(6)
                    .orient('left');

            var yAxis = d3.svg.axis()
                    .ticks(10)
                    .scale(y)
                    .innerTickSize(-height)
                    .outerTickSize(0)
                    .tickPadding(6)
                    .orient('top');

            var layer = svg.selectAll('.layer')
                    .data(layers)
                    .attr('class', 'layer')
                    .style('fill', function(d, i) {return color(i);})
                    .style('opacity', function(d, i) {return i < level ? 1.0 : 0.7;});

            var rect = layer.selectAll('rect')
                    .data(function(d) {return d;})
                    .attr('x', 0)
                    .attr('y', function(d) {return x(d.x);})
                    .attr('width', 0)
                    .attr('height', x.rangeBand());

            rect.transition()
                .delay(function(d, i) {return i * 10;})
                .attr('x', function(d) {return y(d.y0);})
                .attr('width', function(d) {return y(d.y);});

            svg.select('g.x.axis').call(xAxis);
            svg.select('g.y.axis').call(yAxis);
            svg.select('.axis').selectAll('text').remove();

            svg.select('.axis').selectAll('.tick')
                .data(data)
                .append('svg:image')
                .attr('xlink:href', function (d) {return base + '/img/champion/' + d.data.image.full;})
                .attr('x', -size)
                .attr('y', -size / 2)
                .attr('width', size)
                .attr('height', size);
        };

        return draw;
    };

    var base = 'http://ddragon.leagueoflegends.com/cdn/5.24.2';
    var size = 16;

    var drawer;

    $scope.statusChange = function() {
        drawer($scope.status, $scope.level);
    }

    $scope.decrement = function() {
        if($scope.level > 1) {
            $scope.level -= 1;
            drawer($scope.status, $scope.level);
        }
    }

    $scope.increment = function() {
        if($scope.level < 18) {
            $scope.level += 1;
            drawer($scope.status, $scope.level);
        }
    }

    d3.json(base + '/data/en_US/champion.json', function(error, json) {
        var data = [];

        if (error) throw error;
        for(var name in json.data) {
            json.data[name].stats.attackspeed = 0.625 / (1 + json.data[name].stats.attackspeedoffset);
            json.data[name].stats.attackspeedperlevel = json.data[name].stats.attackspeed * (json.data[name].stats.attackspeedperlevel / 100);
            json.data[name].stats.movespeedperlevel = 0;
            delete json.data[name].stats.attackspeedoffset;
            data.push({name: name, data: json.data[name]});
        }

        drawer = StackedBarDrawer(data);
        drawer('attackdamage', $scope.level);
    });
}]);
