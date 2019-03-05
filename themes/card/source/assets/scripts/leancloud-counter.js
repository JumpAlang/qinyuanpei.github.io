var CloudCounter

<script>AV.initialize("{{site.leancloud.app_id}}", "{{site.leancloud.app_key}}");</script>
  <script>
    //�������ʴ���
    function addCount(Counter) {
      // ҳ�棨�������£��е���Ϣ��leancloud_visitors
      // idΪpage.url�� data-flag-titleΪpage.title
      var $visitors = $(".leancloud_visitors");
      var url = $visitors.attr('id').trim();
      var title = $visitors.attr('data-flag-title').trim();
      var query = new AV.Query(Counter);

      // ֻ�������µ�url��ѯLeanCloud�������е�����
      query.equalTo("post_url", url);
      query.find({
        success: function(results) {
          if (results.length > 0) {//˵��LeanCloud���Ѿ���¼����ƪ����
            var counter = results[0];
            counter.fetchWhenSave(true);
            counter.increment("visited_times");// �����������1
            counter.save(null, {
              success: function(counter) {
                var $element = $(document.getElementById(url));
                var newTimes = counter.get('visited_times');
                $element.find('.leancloud-visitors-count').text(newTimes);
              },
              error: function(counter, error) {
                console.log('Failed to save Visitor num, with error message: ' + error.message);
              }
            });
          } else {
            // ִ�����˵��LeanCloud�л�û�м�¼������
            var newcounter = new Counter();
            /* Set ACL */
            var acl = new AV.ACL();
            acl.setPublicReadAccess(true);
            acl.setPublicWriteAccess(true);
            newcounter.setACL(acl);
            /* End Set ACL */
            newcounter.set("post_title", title);// �����±���
            newcounter.set("post_url", url); // ����url
            newcounter.set("visited_times", 1); // ��ʼ���������1��
            newcounter.save(null, { // �ϴ���LeanCloud��������
              success: function(newcounter) {
                var $element = $(document.getElementById(url));
                var newTimes = newcounter.get('visited_times');
                $element.find('.leancloud-visitors-count').text(newTimes);
              },
              error: function(newcounter, error) {
                console.log('Failed to create');
              }
            });
          }
        },
        error: function(error) {
          console.log('Error:' + error.code + " " + error.message);
        }
      });
    }

    //������url��title�����ǰ���ʴ���������+1����
    function showCount(Counter) {
      var $visitors = $(".leancloud_visitors");
      var url = $visitors.attr('id').trim();
      var title = $visitors.attr('data-flag-title').trim();
      var query = new AV.Query(Counter);

      // ֻ�������µ�url��ѯLeanCloud�������е�����
      query.equalTo("post_url", url);
      query.find({
        success: function(results) {
          if (results.length > 0) {//˵��LeanCloud���Ѿ���¼����ƪ����
            var counter = results[0];
            var $element = $(document.getElementById(url));
            var newTimes = counter.get('visited_times');
            $element.find('.leancloud-visitors-count').text(newTimes);
          } else {
            //�������û�鵽��¼���Ǿ����쳣�����
            console.log('�쳣�������Ӧ��û��¼��');
          }
        },
        error: function(error) {
          console.log('Error:' + error.code + " " + error.message);
        }
      });
    }

    //����API��ȡIP
    function getVisitorIpAndJudge() {
      var ip;
      var options = {
        type: 'POST',
        dataType: "json",
        //async: false, //jquery3�п���ֱ��ʹ�ûص�������������ָ��async
        url: "https://freegeoip.net/json/?callback=?"
      };
      $.ajax(options)
      .done(function(data, textStatus, jqXHR) {
        if(textStatus == "success") {
          ip = data.ip;
        }
        judgeVisitor(ip)
      });
    }

    //�жϷÿ��Ƿ��ѷ��ʹ������£�������ʱ�䣬��������������һ�η��ʴ���
    function judgeVisitor(ip) {
      var Counter = AV.Object.extend("visited_times");
      var Visitor = AV.Object.extend("visitors_record");

      var $postInfo = $(".leancloud_visitors");
      var post_url = $postInfo.attr('id').trim();

      var query = new AV.Query(Visitor);

      query.equalTo("visitor_ip", ip);
      query.equalTo("post_url", post_url);
      query.find({
        success: function(results) {
          if (results.length > 0) {
            console.log('��IP�ѷ��ʹ�������');

            var oldVisitor = results[0];

            var lastTime = oldVisitor.updatedAt;
            var curTime = new Date();

            var timePassed = curTime.getTime() - lastTime.getTime();

            if(timePassed > 1 * 60 * 1000) {
              console.log('�����IP��һ�η��ʸ������ѳ�����1���ӣ����·��ʼ�¼�������ӷ��ʴ���');

              addCount(Counter);

              oldVisitor.fetchWhenSave(true);
              oldVisitor.save(null, {
                success: function(oldVisitor) { },
                error: function(oldVisitor, error) {
                  console.log('Failed to save visitor record, with error message: ' + error.message);
                }
              });
            } else {
              console.log('���Ǹ�IP 1�������ظ����ʸ����£������·��ʼ�¼�������ӷ��ʴ���');
              showCount(Counter);
            }
          } else {
            console.log('��IP��һ�η��ʸ����£������µķ��ʼ�¼�������ӷ��ʴ���');

            addCount(Counter);

            var newVisitor = new Visitor();
            /* Set ACL */
            var acl = new AV.ACL();
            acl.setPublicReadAccess(true);
            acl.setPublicWriteAccess(true);
            newVisitor.setACL(acl);
            newVisitor.set("visitor_ip", ip);
            newVisitor.set("post_url", post_url);
            newVisitor.save(null, { // �ϴ���LeanCloud��������
              success: function(newVisitor) { },
              error: function(newVisitor, error) {
                console.log('Failed to create visitor record, with error message: ' + error.message);
              }
            });
          }
        },
        error: function(error) {
          console.log('Error:' + error.code + " " + error.message);
          addCount(Counter);
        }
      });
    }

    $(function() {
      if ($('.leancloud_visitors').length == 1) {
        // ����ҳ�棬�����жϷ������Է��������ķ������ӷ��ʴ���
        getVisitorIpAndJudge();
      } else if ($('.post-link').length > 1){
        // ��ҳ ��δʹ��
        // showHitCount(Counter);
      }
    });
  </script>